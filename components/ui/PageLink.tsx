import Link from "next/link";

export default function PageLink({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      className={`
        bg-green-200 px-12 py-4 rounded shadow 
        hover:opacity-75 text-base font-semibold
      `}
      href={{ pathname: href }}
    >
      {children}
    </Link>
  );
}
