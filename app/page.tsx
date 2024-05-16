import classNames from "classnames";
import Link from "next/link";

export default function Home() {
  return (
    <main
      className={classNames(
        "min-h-screen flex flex-col items-center justify-around p-24",
      )}
    >
      <header className="text-4xl font-semibold">Tax Helper</header>
      <div className="flex flex-col w-96 mx-auto items-stretch text-center gap-10">
        <Link
          className={`
          bg-green-200 px-12 py-4 rounded shadow 
          hover:opacity-75 text-base font-semibold
        `}
          href="/guide"
        >
          Guide
        </Link>
        <Link
          className={`
          bg-green-200 px-12 py-4 rounded shadow 
          hover:opacity-75 text-base font-semibold
        `}
          href="/report"
        >
          Compute my tax report
        </Link>
      </div>
    </main>
  );
}
