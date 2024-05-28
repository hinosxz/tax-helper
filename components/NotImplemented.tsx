import { Link } from "@/components/ui/Link";

const GITHUB_REPO_URL = "https://github.com/hinosxz/tax-helper";

export default function NotImplemented() {
  return (
    <div>
      not implemented yet, feel free to contribute to{" "}
      <Link href={GITHUB_REPO_URL} isExternal>
        {" "}
        the repository
      </Link>
    </div>
  );
}
