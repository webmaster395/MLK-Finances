"use client";

import Link from "next/link";
import { useActionState } from "react";
import { connexion, type EtatFormulaire } from "@/lib/auth/actions";
import { Champ, MessageFormulaire } from "./champ";

const etatInitial: EtatFormulaire = {};

export function FormulaireConnexion({ suivant, lienInvalide }: { suivant?: string; lienInvalide?: boolean }) {
  const [etat, action, enCours] = useActionState(connexion, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {lienInvalide && !etat.message ? (
        <MessageFormulaire message="Ce lien n'est plus valable ou a déjà été utilisé. Connectez-vous, ou demandez un nouveau lien." />
      ) : null}
      <MessageFormulaire ok={etat.ok} message={etat.message} />
      {suivant ? <input type="hidden" name="suivant" value={suivant} /> : null}
      <Champ
        id="email"
        libelle="Adresse e-mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        defaultValue={etat.valeurs?.email}
      />
      <Champ id="motdepasse" libelle="Mot de passe" type="password" autoComplete="current-password" required />
      <button type="submit" disabled={enCours} className="btn btn-orange w-full disabled:opacity-60">
        {enCours ? "Connexion…" : "Se connecter"}
      </button>
      <div className="flex flex-col gap-2 text-center text-sm font-semibold">
        <Link href="/mot-de-passe-oublie" className="underline underline-offset-2">
          Mot de passe oublié ?
        </Link>
        <span>
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="underline underline-offset-2">
            S&apos;inscrire
          </Link>
        </span>
      </div>
    </form>
  );
}
