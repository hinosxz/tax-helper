"use client";

import { useState } from "react";
import classNames from "classnames";
import toast from "react-hot-toast";
import { ClipboardIcon, CheckIcon } from "@heroicons/react/24/solid";
import { Section } from "@/components/ui/Section";

interface Props {
  email: string;
}

export const EmailPreview = ({ email }: Props) => {
  const [copied, setCopied] = useState(false);
  const onCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copié dans le presse-papier");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Section
      title="Email à envoyer au SIP"
      actions={
        <button
          type="button"
          onClick={onCopy}
          className={classNames(
            "flex items-center gap-2 px-3 py-1.5 rounded shadow text-sm font-semibold hover:opacity-75",
            copied ? "bg-green-200" : "bg-blue-100",
          )}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <ClipboardIcon className="h-4 w-4" />
          )}
          {copied ? "Copié" : "Copier l'email"}
        </button>
      }
    >
      <textarea
        readOnly
        value={email}
        className={classNames(
          "w-full h-[28rem] font-mono text-xs",
          "border rounded-md p-3 bg-white",
        )}
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
