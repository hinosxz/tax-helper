import classNames from "classnames";
import Link from "next/link";
import { getDictionary, hasLocale, type Locale } from "./dictionaries";

export default async function Home({ params }: { params: { lang: string } }) {
  const lang: Locale = hasLocale(params.lang) ? params.lang : "en";
  const dict = await getDictionary(lang);
  return (
    <main
      className={classNames(
        "min-h-screen flex flex-col items-center justify-around p-24",
      )}
    >
      <header className="text-4xl font-semibold">{dict.home.title}</header>
      <div className="flex flex-col w-96 mx-auto items-stretch text-center gap-10">
        <Link
          className={`
          bg-green-200 px-12 py-4 rounded shadow
          hover:opacity-75 text-base font-semibold
        `}
          href={`/${lang}/report`}
        >
          {dict.home.computeReport}
        </Link>
      </div>
    </main>
  );
}
