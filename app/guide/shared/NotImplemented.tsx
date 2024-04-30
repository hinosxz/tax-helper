import { Link } from "@/app/guide/shared/ui/Link";

export default function NotImplemented() {
  const githubRepoURL = "https://github.com/hinosxz/tax-helper";
  return (
    <div>
      not implemented yet, feel free to contribute to{" "}
      <Link href={githubRepoURL} isExternal>
        {" "}
        the repository
      </Link>
    </div>
  );
}
