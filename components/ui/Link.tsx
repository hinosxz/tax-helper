import type { ReactNode } from "react";

interface LinkProps {
  children: ReactNode;
  href: string;
  isExternal?: boolean;
}

export const Link = ({ href, children, isExternal }: LinkProps) => (
  <span className="text-black font-semibold hover:opacity-75">
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  </span>
);
