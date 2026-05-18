"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import classNames from "classnames";

export interface BackProps {
  /** Add an extra className to Back wrapper */
  className?: string;
  /** Label to display next to the back arrow */
  label: string;
}

export const Back: React.FunctionComponent<BackProps> = ({ label }) => {
  const router = useRouter();
  return (
    <div
      className={classNames(
        "w-fit flex p-4 items-center gap-2",
        "hover:opacity-75 cursor-pointer",
      )}
      onClick={() => router.back()}
    >
      <ArrowLeftIcon className="h-4" />
      {label}
    </div>
  );
};
