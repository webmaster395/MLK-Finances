"use client";

import { useActionState } from "react";
import { Champ, MessageFormulaire } from "@/components/auth/champ";
import { CIVILITES, TRANCHES_AGE } from "@/lib/auth/profil";
import { modifierProfil, type EtatProfil } from "@/lib/profil-actions";

const etatInitial: EtatProfil = {};

type Props = {
  email: string;
  civilite: string | null;
  prenom: string;
  nom: string;
  trancheAge: string | null;
};

export function FormulaireProfil({ email, civilite, prenom, nom, trancheAge }: Props) {
  const [etat, action, enCours] = useActionState(modifierProfil, etatInitial);
  // Après un envoi, on réaffiche ce qui vient d'être saisi (sinon le formulaire reprend les anciennes valeurs)
  const v = etat.valeurs;
  const civiliteAffichee = v?.civilite ?? civilite;

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <MessageFormulaire ok={etat.ok} message={etat.message} />

      <fieldset className="flex flex-col gap-1.5">
        <legend className="mb-1.5 text-sm font-semibold text-noir">Civilité</legend>
        <div className="flex flex-wrap gap-x-8 gap-y-2">
          {CIVILITES.map(({ code, libelle }) => (
            <label key={code} className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
              <input type="radio" name="civilite" value={code} required defaultChecked={civiliteAffichee === code} className="size-5 accent-rose" />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Champ id="prenom" libelle="Prénom" autoComplete="given-name" required maxLength={100} defaultValue={v?.prenom ?? prenom} />
        <Champ id="nom" libelle="Nom" autoComplete="family-name" required maxLength={100} defaultValue={v?.nom ?? nom} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="tranche_age" className="text-sm font-semibold text-noir">
          Tranche d&apos;âge
        </label>
        <select
          key={v?.tranche_age ?? trancheAge ?? ""} // React ne met pas à jour la valeur par défaut d'une liste déjà affichée
          id="tranche_age"
          name="tranche_age"
          required
          defaultValue={v?.tranche_age ?? trancheAge ?? ""}
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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold text-noir">
          Adresse e-mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          aria-describedby="aide-email"
          className="min-h-11 w-full cursor-not-allowed rounded-md border border-black/15 bg-black/5 px-3 text-base font-semibold text-noir/70"
        />
        <p id="aide-email" className="text-xs">
          Votre adresse e-mail sert à vous connecter : elle ne peut pas être modifiée ici. Contactez l&apos;équipe pour la changer.
        </p>
      </div>

      <button type="submit" disabled={enCours} className="btn btn-orange w-fit disabled:opacity-60">
        {enCours ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
