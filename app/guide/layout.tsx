"use client";

import { Back } from "@/components/Back";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <header>
        <Back />
      </header>
      <main className="flex flex-col items-center justify-around p-24">
        {children}
      </main>
    </div>
  );
}
