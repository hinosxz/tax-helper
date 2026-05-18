import "server-only";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]();
