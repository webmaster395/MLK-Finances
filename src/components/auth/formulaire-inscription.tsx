"use client";

import Link from "next/link";
import { useActionState } from "react";
import { inscription, type EtatFormulaire } from "@/lib/auth/actions";
import { Champ, MessageFormulaire } from "./champ";

const etatInitial: EtatFormulaire = {};

export function FormulaireInscription() {
  const [etat, action, enCours] = useActionState(inscription, etatInitial);

  if (etat.ok) {
    return (
      <div className="flex flex-col gap-4">
        <MessageFormulaire ok message={etat.message} />
        <Link href="/connexion" className="btn btn-rose w-full">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <MessageFormulaire message={etat.message} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ id="prenom" libelle="Prénom" autoComplete="given-name" required maxLength={100} defaultValue={etat.valeurs?.prenom} />
        <Champ id="nom" libelle="Nom" autoComplete="family-name" required maxLength={100} defaultValue={etat.valeurs?.nom} />
      </div>
      <Champ
        id="email"
        libelle="Adresse e-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={etat.valeurs?.email}
      />
      <Champ
        id="motdepasse"
        libelle="Mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aide="8 caractères minimum, avec au moins une lettre et un chiffre."
      />
      <Champ id="confirmation" libelle="Confirmer le mot de passe" type="password" autoComplete="new-password" required />
      <button type="submit" disabled={enCours} className="btn btn-orange w-full disabled:opacity-60">
        {enCours ? "Inscription…" : "Créer mon compte"}
      </button>
      <p className="text-center text-sm font-semibold">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
