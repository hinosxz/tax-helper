"use client";
import { useId } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Locale } from "@/app/[lang]/dictionaries";

const LOCALES: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
];

// Heroicons outline `LanguageIcon`, baked in so it can live in the select's
// background-image (clicking it actually opens the native dropdown).
const ICON_BG_IMAGE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='black'><path stroke-linecap='round' stroke-linejoin='round' d='m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802'/></svg>\")";

interface LanguageToggleProps {
  currentLang: Locale;
  label: string;
}

export const LanguageToggle = ({ currentLang, label }: LanguageToggleProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();

  return (
    <select
      id={id}
      title={label}
      value={currentLang}
      onChange={(event) => {
        const lang = event.target.value as Locale;
        if (lang === currentLang) return;
        const segments = pathname.split("/");
        segments[1] = lang;
        router.push(segments.join("/") as never);
      }}
      style={{
        backgroundImage: ICON_BG_IMAGE,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left 0.25rem center",
        backgroundSize: "1.25rem 1.25rem",
      }}
      className="appearance-none bg-transparent border-none cursor-pointer text-sm font-medium pl-8 pr-1 hover:opacity-75"
    >
      {LOCALES.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
