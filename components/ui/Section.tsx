import type { ReactNode } from "react";

interface SectionProps {
  className?: string;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const Section = ({
  className,
  title,
  children,
  actions,
}: SectionProps) => (
  <div className={className}>
    {actions ? (
      <div className="flex justify-between align-center mb-4">
        <div className="text-lg font-bold my-auto">{title}</div>
        <div className="my-auto">{actions}</div>
      </div>
    ) : (
      <div className="text-lg font-bold mb-2">{title}</div>
    )}
    {children}
  </div>
);
