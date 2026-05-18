import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";

import QueryProvider from "@/components/QueryProvider";
import { Back } from "@/components/Back";
import { ForkMessage } from "@/components/ForkMessage";

import "../globals.css";
import { getDictionary, hasLocale, type Locale } from "./dictionaries";

interface LayoutParams {
  lang: string;
}

export async function generateMetadata({
  params,
}: {
  params: LayoutParams;
}): Promise<Metadata> {
  const lang: Locale = hasLocale(params.lang) ? params.lang : "en";
  const dict = await getDictionary(lang);
  return {
    title: dict.metadata.title,
    description: dict.metadata.description,
  };
}

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "fr" }];
}

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: LayoutParams;
}>) {
  const lang: Locale = hasLocale(params.lang) ? params.lang : "en";
  const dict = await getDictionary(lang);
  return (
    <html lang={lang}>
      <body className={inter.className}>
        <Toaster position="top-center" />
        <QueryProvider>
          <div className="min-h-screen">
            <header>
              <ForkMessage dict={dict.nav.forkMessage} />
              <Back label={dict.nav.back} />
            </header>
            <main className="container mx-auto mb-8">{children}</main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
