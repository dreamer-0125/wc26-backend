import { useDashboardStore } from "@/stores/dashboard";
import React, { useEffect, FC, useMemo } from "react";
import { MashImage } from "../elements/MashImage";

interface LogoTextProps {
  className?: string;
}

const LogoWithText: FC<LogoTextProps> = ({ className: classes }) => {
  const { isDark, settings } = useDashboardStore();

  const fullLogoSrc = useMemo(() => {
    if (settings?.fullLogo || settings?.fullLogoDark) {
      return isDark
        ? settings?.fullLogoDark || settings?.fullLogo
        : settings?.fullLogo;
    }
    return "";
  }, [isDark, settings]);

  return (
    <div className={`flex items-center h-[48px] w-[400px] ${classes}`}>
      <MashImage
        className="max-h-[48px] w-full fill-current"
        src={"/img/logo/logo-with-text.png"}
        alt="Workflow"
        width={384}
        height={48}
      />
    </div>
  );
};

export default LogoWithText;
