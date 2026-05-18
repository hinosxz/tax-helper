import {
  getDictionary,
  hasLocale,
  type Locale,
} from "@/app/[lang]/dictionaries";
import { ReportPage } from "./_Page";

export default async function Page({ params }: { params: { lang: string } }) {
  const lang: Locale = hasLocale(params.lang) ? params.lang : "en";
  const dict = await getDictionary(lang);
  return <ReportPage dict={dict} />;
}
