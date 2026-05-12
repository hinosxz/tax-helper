"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/solid";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

interface Props {
  email: string;
}

export const EmailPreview = ({ email }: Props) => {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copié dans le presse-papier");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Impossible de copier l'email");
    }
  };

  return (
    <Section
      title="Email à envoyer au SIP"
      actions={
        <Button
          onClick={onCopy}
          color={copied ? "softGreen" : "blue"}
          icon={copied ? CheckIcon : ClipboardIcon}
          label={copied ? "Copié" : "Copier l'email"}
        />
      }
    >
      <textarea
        readOnly
        value={email}
        className="w-full h-[28rem] font-mono text-xs border rounded-md p-3 bg-white"
      />
      <p className="text-xs text-gray-500 mt-2">
        À déposer via la messagerie sécurisée impots.gouv.fr, rubrique «{" "}
        J&apos;ai une question sur le calcul de mon impôt », après réception de
        l&apos;avis d&apos;imposition. Joindre les justificatifs listés en bas
        du courrier.
      </p>
    </Section>
  );
};
