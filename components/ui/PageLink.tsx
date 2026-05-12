import Link from "next/link";

export default function PageLink({
  children,
  color = "green",
  href,
}: {
  children: React.ReactNode;
  color?: "blue" | "green";
  href: string;
}) {
  return (
    <Link
      className={`
        ${color === "green" ? "bg-green-200" : "bg-blue-200"}
        px-12 py-4 rounded shadow
        hover:opacity-75 text-base font-semibold
      `}
      href={{ pathname: href }}
    >
      {children}
    </Link>
  );
}
