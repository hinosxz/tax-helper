import { MessageBox } from "@/components/ui/MessageBox";
import { Link } from "@/components/ui/Link";
import { headers } from "next/headers";
import * as React from "react";

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
        THIS IS A LOCAL DEV ENVIRONMENT
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
