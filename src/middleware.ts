import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, JWTVerifyResult } from "jose";
import { gate } from "./utils/gate";

const AUTH_PAGES = ["/login", "/register", "/forgot", "/reset"];

const tokenSecret = process.env.APP_ACCESS_TOKEN_SECRET;
const dev = process.env.NODE_ENV !== "production";
const frontendPort = process.env.NEXT_PUBLIC_FRONTEND_PORT || 3000;
const siteUrl = dev
  ? `http://localhost:${frontendPort}`
  : process.env.NEXT_PUBLIC_SITE_URL;
const isFrontendEnabled = process.env.NEXT_PUBLIC_FRONTEND === "true";
const defaultUserPath = process.env.NEXT_PUBLIC_DEFAULT_USER_PATH || "/user";
const isMaintenance =
  process.env.NEXT_PUBLIC_MAINTENANCE_STATUS === "true" || false;

// Validate critical environment variables but don't throw at module load
// We'll handle errors gracefully in the middleware function
const hasRequiredEnvVars = !!tokenSecret && (dev || !!siteUrl);

interface Role {
  name: string;
  permissions: string[];
}

interface RolesCache {
  [key: string]: Role;
}

let rolesCache: RolesCache | null = null;
let rolesFetchInProgress = false;
let lastRolesFetchAttempt = 0;
const ROLES_FETCH_COOLDOWN = 5000; // 5 seconds cooldown between fetch attempts

async function fetchRolesAndPermissions(request: NextRequest) {
  // Prevent concurrent fetches and respect cooldown period
  const now = Date.now();
  if (
    rolesFetchInProgress ||
    (lastRolesFetchAttempt > 0 && now - lastRolesFetchAttempt < ROLES_FETCH_COOLDOWN)
  ) {
    return;
  }

  rolesFetchInProgress = true;
  lastRolesFetchAttempt = now;

  try {
    // Use request URL in production to ensure correct host/port, fallback to siteUrl
    let apiUrl: string;
    if (dev) {
      apiUrl = `${siteUrl}/api/auth/role`;
    } else {
      // In production, use the request's origin to ensure correct URL
      const origin = request.nextUrl.origin;
      apiUrl = `${origin}/api/auth/role`;
    }

    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Note: setTimeout is not available in Edge runtime
    // We rely on fetch's built-in timeout handling and Edge runtime limits
    try {
      const response = await fetch(apiUrl, { headers });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          rolesCache = data.reduce((acc: RolesCache, role: any) => {
            if (role && role.id && role.name && Array.isArray(role.permissions)) {
              acc[role.id] = {
                name: role.name,
                permissions: role.permissions.map(
                  (permission: any) => permission?.name || permission
                ).filter(Boolean),
              };
            }
            return acc;
          }, {});
        }
      } else {
        console.error(
          `Failed to fetch roles and permissions: ${response.status} ${response.statusText}`
        );
        // Don't reset cache on client errors (4xx), only on server errors (5xx)
        if (response.status >= 500) {
          rolesCache = null;
        }
      }
    } catch (fetchError: any) {
      console.error("Error fetching roles and permissions:", fetchError.message || fetchError);
      // Only reset cache on network errors
      if (fetchError.name !== "AbortError") {
        rolesCache = null;
      }
    }
  } catch (error: any) {
    console.error("Unexpected error in fetchRolesAndPermissions:", error?.message || error);
    // Don't reset cache on unexpected errors to preserve existing data
  } finally {
    rolesFetchInProgress = false;
  }
}

async function hasPermission(
  payload: {
    sub: {
      role: number;
    };
  },
  path: string
): Promise<boolean> {
  if (rolesCache && payload.sub && typeof payload.sub.role === "number") {
    const roleId = payload.sub.role;
    const role = rolesCache[roleId];
    if (role) {
      if (role.name === "Super Admin") {
        return true;
      }
      let requiredPermission = gate[path];
      if (!requiredPermission && path.startsWith("/admin")) {
        requiredPermission = "Access Admin Dashboard";
      }
      if (
        requiredPermission &&
        role.permissions.length > 0 &&
        role.permissions.includes(requiredPermission)
      ) {
        return true;
      }
    }
  }
  return false;
}

async function verifyToken(
  accessToken: string
): Promise<JWTVerifyResult | null> {
  try {
    const result = await jwtVerify(
      accessToken,
      new TextEncoder().encode(tokenSecret),
      {
        clockTolerance: 300, // Allow for 5 minutes of clock skew
      }
    );
    return result;
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      console.warn("Token expired:", error.message);
    } else {
      console.error("Error verifying token:", error.message);
    }
    return null;
  }
}

async function refreshToken(request: NextRequest) {
  try {
    // Use request URL in production to ensure correct host/port, fallback to siteUrl
    let apiUrl: string;
    if (dev) {
      apiUrl = `${siteUrl}/api/auth/session`;
    } else {
      // In production, use the request's origin to ensure correct URL
      const origin = request.nextUrl.origin;
      apiUrl = `${origin}/api/auth/session`;
    }

    // Note: setTimeout and AbortController with timeout are not reliably available in Edge runtime
    // We'll rely on fetch's built-in timeout handling
    const response = await fetch(apiUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || "",
      },
    });

    if (response.ok) {
      const cookies =
        response.headers.get("set-cookie") || response.headers.get("cookie");
      if (cookies) {
        const accessToken = cookies.match(/accessToken=([^;]+);/)?.[1] || null;
        return accessToken;
      } else {
        console.error("No 'set-cookie' header in response.");
      }
    } else {
      console.error(
        "Failed to refresh token:",
        response.status,
        response.statusText
      );
    }
  } catch (error: any) {
    console.error("Error refreshing token:", error?.message || error);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  // Early return if critical environment variables are missing
  if (!hasRequiredEnvVars) {
    console.error("Missing required environment variables. Check APP_ACCESS_TOKEN_SECRET and NEXT_PUBLIC_SITE_URL");
    return NextResponse.next();
  }

  try {
    const { pathname } = request.nextUrl;

    // Fetch roles and permissions if not done yet (non-blocking)
    // Only fetch if we don't have cache and we're not in a critical path
    // Skip fetch entirely if it might cause issues in production
    if (!rolesCache || Object.keys(rolesCache).length === 0) {
      // Don't await - let it fetch in background to avoid blocking requests
      // Wrap in try-catch to prevent any unhandled promise rejections
      try {
        fetchRolesAndPermissions(request).catch((error) => {
          // Silently handle errors - don't log in production to avoid noise
          if (dev) {
            console.error("Background roles fetch failed:", error?.message || error);
          }
        });
      } catch (error) {
        // Ignore errors during fetch initiation
        if (dev) {
          console.error("Failed to initiate roles fetch:", error);
        }
      }
    }

    if (!isFrontendEnabled && (pathname === "/" || pathname === "")) {
      const isLoggedIn = request.cookies.has("accessToken");
      const url = new URL(request.nextUrl);

      if (isLoggedIn) {
        url.pathname = defaultUserPath;
      } else {
        url.pathname = "/login";
      }
      return NextResponse.redirect(url.toString());
    }

    let accessToken = request.cookies.get("accessToken")?.value;
    let payload: any = null;
    let isTokenValid = false;

    if (accessToken) {
      const verifiedToken = await verifyToken(accessToken);
      if (verifiedToken) {
        payload = verifiedToken.payload;
        isTokenValid = true;
      }
    }

    if (!isTokenValid) {
      const sessionId = request.cookies.get("sessionId")?.value;
      if (sessionId) {
        accessToken = (await refreshToken(request)) as string;
        if (accessToken) {
          const verifiedToken = await verifyToken(accessToken);
          if (verifiedToken) {
            payload = verifiedToken.payload;
            isTokenValid = true;

            // Set the new token in cookies
            const response = NextResponse.next();
            response.cookies.set("accessToken", accessToken, {
              httpOnly: true,
              secure: !dev,
              sameSite: "lax",
              path: "/",
            });
            return response;
          }
        }
      }
    }

    if (isMaintenance && pathname !== "/login") {
      if (!isTokenValid) {
        const url = new URL(request.nextUrl);
        url.pathname = "/maintenance";
        return NextResponse.redirect(url.toString());
      } else {
        if (!payload || !payload.sub || !payload.sub.role) {
          const url = new URL(request.nextUrl);
          url.pathname = "/maintenance";
          return NextResponse.redirect(url.toString());
        }
        const roleId = payload.sub.role;
        const userRole = rolesCache?.[roleId];
        // If roles cache is not available, allow access (graceful degradation)
        if (!rolesCache) {
          // Roles not loaded yet, allow access to prevent blocking
          // This is a fallback for when roles API is unavailable
        } else if (
          !userRole ||
          (userRole.name !== "Super Admin" &&
            !userRole.permissions.includes("Access Admin Dashboard"))
        ) {
          const url = new URL(request.nextUrl);
          url.pathname = "/maintenance";
          return NextResponse.redirect(url.toString());
        }
      }
    }

    // If the user is authenticated and tries to access auth pages, redirect to default path
    if (isTokenValid && AUTH_PAGES.includes(pathname)) {
      const returnUrl =
        request.nextUrl.searchParams.get("return") || defaultUserPath;
      const url = new URL(request.nextUrl);
      url.pathname = returnUrl;
      url.searchParams.delete("return");
      return NextResponse.redirect(url.toString());
    }

    // Redirect unauthenticated users trying to access restricted pages
    if (
      !isTokenValid &&
      (pathname.startsWith("/user") || pathname.startsWith("/admin"))
    ) {
      const url = new URL(request.nextUrl);
      url.pathname = "/login";
      url.searchParams.set("return", pathname);
      return NextResponse.redirect(url.toString());
    }

    if (
      isTokenValid &&
      (pathname.startsWith("/admin") || pathname in gate)
    ) {
      // Only check permissions if roles cache is available
      // If cache is not available, allow access (graceful degradation)
      if (rolesCache && !(await hasPermission(payload!, pathname))) {
        const url = new URL(request.nextUrl);
        url.pathname = defaultUserPath;
        url.searchParams.delete("return");
        return NextResponse.redirect(url.toString());
      }
      // If rolesCache is null, allow access to prevent blocking users
    }

    return NextResponse.next();
  } catch (error: any) {
    // Catch any unexpected errors to prevent middleware from crashing
    console.error("Middleware error:", error?.message || error);
    
    // In production, log the error but don't block the request
    // Allow the request to proceed to avoid breaking the entire site
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/user/:path*",
    "/login",
    "/register",
    "/forgot",
    "/reset",
    "/uploads/:path*",
  ],
};
