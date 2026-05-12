import classNames from "classnames";
import PageLink from "@/components/ui/PageLink";

export default function Home() {
  return (
    <main
      className={classNames(
        "min-h-screen flex flex-col items-center justify-around p-24",
      )}
    >
      <header className="text-4xl font-semibold">Tax Helper</header>
      <div className="flex flex-col w-96 mx-auto items-stretch text-center gap-10">
        <PageLink href="/report">Compute my French tax report</PageLink>
        <PageLink href="/cehr" color="blue">
          Lissage CEHR (système du quotient)
        </PageLink>
      </div>
    </main>
  );
}
