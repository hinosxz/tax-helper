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
      <Link
        className={`
          bg-green-200 px-12 py-4 rounded shadow 
          hover:opacity-75 text-base font-semibold
        `}
        href="/guide"
      >
        Start
      </Link>
    </main>
  );
}
