"use client";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  return (
    <div className="h-screen">
      <header>
        <div
          className={
            "flex p-4 hover:opacity-75 cursor-pointer items-center gap-2"
          }
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4" />
          Previous
        </div>
      </header>
      <main className={"flex flex-col items-center justify-around p-24"}>
        {children}
      </main>
    </div>
  );
}
