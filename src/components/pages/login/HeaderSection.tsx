import LogoWithText from "@/components/vector/LogoWithText";
import ThemeSwitcher from "@/components/widgets/ThemeSwitcher";
import Link from "next/link";
import { memo } from "react";

const HeaderSectionBase = () => (
  <div className="absolute inset-x-0 top-6 mx-auto w-full max-w-sm px-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <Link href="/">
          <LogoWithText className="h-6 text-primary-500" />
        </Link>
      </div>
      <div className="flex items-center justify-end">
        <ThemeSwitcher />
      </div>
    </div>
  </div>
);

export const HeaderSection = memo(HeaderSectionBase);
