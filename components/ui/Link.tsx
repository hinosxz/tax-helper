import type { ReactNode } from "react";

interface LinkProps {
  children: ReactNode;
  href: string;
  isExternal?: boolean;
  variant?: "default" | "blue";
}

export const Link = ({
  href,
  children,
  isExternal,
  variant = "default",
}: LinkProps) => (
  <span
    className={
      variant === "blue"
        ? "text-blue-600 hover:underline"
        : "text-black font-semibold hover:opacity-75"
    }
  >
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  </span>
);
