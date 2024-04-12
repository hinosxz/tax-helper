import { ReactNode } from "react";

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
      <div className="flex justify-between align-center">
        <div className="text-lg font-bold my-auto">{title}</div>
        <div className="my-auto">{actions}</div>
      </div>
    ) : (
      <div className="text-lg font-bold">{title}</div>
    )}
    <div>{children}</div>
  </div>
);
