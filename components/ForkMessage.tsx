import { MessageBox } from "@/components/ui/MessageBox";
import { Link } from "@/components/ui/Link";
import { headers } from "next/headers";
import { BannerBadge } from "./BannerBadge";

const OFFICIAL_HOSTNAME = "tax-helper-olive.vercel.app";
const OFFICIAL_URL = `https://${OFFICIAL_HOSTNAME}/`;

export const ForkMessage = () => {
  const headersList = headers();
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname
      : headersList.get("host");

  const isLocal = hostname?.startsWith("localhost");

  if (isLocal) {
    return (
      <MessageBox title="" level="info">
        <div className="flex flex-wrap items-center gap-2">
          <span>THIS IS A LOCAL DEV ENVIRONMENT</span>
          <BannerBadge />
        </div>
      </MessageBox>
    );
  }

  const isFork = !hostname?.startsWith(OFFICIAL_HOSTNAME);
  if (isFork) {
    return (
      <MessageBox title="" level="warning">
        THIS IS A FORK, OFFICIAL TAX HELPER IS AT{" "}
        <Link href={OFFICIAL_URL}>{OFFICIAL_URL}</Link>
      </MessageBox>
    );
  }

  return null;
};
