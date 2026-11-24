"use client";

import { useActionState } from "react";
import { reinitialiserMotDePasse, type EtatFormulaire } from "@/lib/auth/actions";
import { Champ, MessageFormulaire } from "./champ";

const etatInitial: EtatFormulaire = {};

export function FormulaireReinitialisation() {
  const [etat, action, enCours] = useActionState(reinitialiserMotDePasse, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <MessageFormulaire message={etat.message} />
      <Champ
        id="motdepasse"
        libelle="Nouveau mot de passe"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        aide="8 caractères minimum, avec au moins une lettre et un chiffre."
      />
      <Champ id="confirmation" libelle="Confirmer le nouveau mot de passe" type="password" autoComplete="new-password" required />
      <button type="submit" disabled={enCours} className="btn btn-principal w-full disabled:opacity-60">
        {enCours ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </button>
    </form>
  );
}
