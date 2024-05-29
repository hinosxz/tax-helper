import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import QueryProvider from "@/components/QueryProvider";
import { Back } from "@/components/Back";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tax Helper",
  description: `
  A simple web app to help determine how you should report your taxes 
  to the French and US administrations.
  `,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" />
        <QueryProvider>
          <div className="min-h-screen">
            <header>
              <Back />
            </header>
            <main className="container mx-auto">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
