"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import classNames from "classnames";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header>
        <div
          className={classNames(
            "w-fit flex p-4 items-center gap-2",
            "hover:opacity-75 cursor-pointer",
          )}
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4" />
          Previous
        </div>
      </header>
      <main className="flex flex-col items-center justify-around p-24">
        {children}
      </main>
    </div>
  );
}
