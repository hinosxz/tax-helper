import { ReactNode } from "react";

interface SectionProps {
  className?: string;
  title: string;
  children: ReactNode;
}

export const Section = ({ className, title, children }: SectionProps) => (
  <div className={className}>
    <div className="text-lg font-bold">{title}</div>
    <div>{children}</div>
  </div>
);
