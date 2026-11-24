"use client";

import Link from "next/link";
import { useActionState } from "react";
import { inscription, type EtatFormulaire } from "@/lib/auth/actions";
import { CIVILITES, TRANCHES_AGE } from "@/lib/auth/profil";
import { Champ, MessageFormulaire } from "./champ";

const etatInitial: EtatFormulaire = {};

export function FormulaireInscription() {
  const [etat, action, enCours] = useActionState(inscription, etatInitial);

  if (etat.ok) {
    return (
      <div className="flex flex-col gap-4">
        <MessageFormulaire ok message={etat.message} />
        <Link href="/connexion" className="btn btn-accent w-full">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <MessageFormulaire message={etat.message} />
      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-semibold text-noir">Civilité</legend>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {CIVILITES.map(({ code, libelle }) => (
            <label key={code} className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
              <input
                type="radio"
                name="civilite"
                value={code}
                required
                defaultChecked={etat.valeurs?.civilite === code}
                className="size-5 accent-accent"
              />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ id="prenom" libelle="Prénom" autoComplete="given-name" required maxLength={100} defaultValue={etat.valeurs?.prenom} />
        <Champ id="nom" libelle="Nom" autoComplete="family-name" required maxLength={100} defaultValue={etat.valeurs?.nom} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="tranche_age" className="text-sm font-semibold text-noir">
          Tranche d&apos;âge
        </label>
        <select
          id="tranche_age"
          name="tranche_age"
          required
          defaultValue={etat.valeurs?.tranche_age ?? ""}
          className="min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir"
        >
          <option value="" disabled>
            Choisissez…
          </option>
          {TRANCHES_AGE.map(({ code, libelle }) => (
            <option key={code} value={code}>
              {libelle}
            </option>
          ))}
        </select>
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
      <button type="submit" disabled={enCours} className="btn btn-principal w-full disabled:opacity-60">
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
