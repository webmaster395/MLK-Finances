"use client";

import Link from "next/link";
import { useActionState } from "react";
import { motDePasseOublie, type EtatFormulaire } from "@/lib/auth/actions";
import { Champ, MessageFormulaire } from "./champ";

const etatInitial: EtatFormulaire = {};

export function FormulaireOubli() {
  const [etat, action, enCours] = useActionState(motDePasseOublie, etatInitial);

  if (etat.ok) {
    return (
      <div className="flex flex-col gap-4">
        <MessageFormulaire ok message={etat.message} />
        <Link href="/connexion" className="btn btn-rose w-full">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <MessageFormulaire message={etat.message} />
      <Champ
        id="email"
        libelle="Adresse e-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={etat.valeurs?.email}
      />
      <button type="submit" disabled={enCours} className="btn btn-orange w-full disabled:opacity-60">
        {enCours ? "Envoi…" : "Recevoir un lien"}
      </button>
      <p className="text-center text-sm font-semibold">
        <Link href="/connexion" className="underline underline-offset-2">
          Retour à la connexion
        </Link>
      </p>
    </form>
  );
}
