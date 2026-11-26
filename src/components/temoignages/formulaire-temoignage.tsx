"use client";

import { startTransition, useActionState, useRef } from "react";
import { MessageFormulaire } from "@/components/auth/champ";
import { envoyerTemoignage, modifierMonTemoignage, type EtatTemoignage } from "@/lib/temoignages-actions";

const etatInitial: EtatTemoignage = {};

const CHOIX = [
  { valeur: "prive", libelle: "Le garder pour moi", aide: "Une note personnelle : personne d'autre ne la voit, pas même l'équipe." },
  {
    valeur: "partage",
    libelle: "Le partager avec tous les participants",
    aide: "L'équipe MLK Parcours Finances le valide avant qu'il apparaisse. Vous pouvez préciser dans le texte à qui il s'adresse (un pasteur, par exemple).",
  },
] as const;

/**
 * Écrire un nouveau témoignage, ou corriger l'un des siens (et choisir qui le voit) tant qu'il n'est pas validé.
 * L'envoi passe par onSubmit : React ne vide pas le champ, une saisie refusée reste à l'écran.
 */
export function FormulaireTemoignage({ existant }: { existant?: { id: string; texte: string; partage: boolean } }) {
  const formulaire = useRef<HTMLFormElement>(null);
  const [etat, envoyer, enCours] = useActionState(async (precedent: EtatTemoignage, donnees: FormData) => {
    const resultat = existant ? await modifierMonTemoignage(precedent, donnees) : await envoyerTemoignage(precedent, donnees);
    // Après un nouvel envoi réussi, le champ est vidé pour le témoignage suivant
    if (resultat.ok && !existant) formulaire.current?.reset();
    return resultat;
  }, etatInitial);
  const prefixe = existant?.id ?? "nouveau";

  return (
    <form
      ref={formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        const donnees = new FormData(e.currentTarget);
        startTransition(() => envoyer(donnees));
      }}
      className="flex flex-col gap-3"
    >
      {existant ? <input type="hidden" name="id" value={existant.id} /> : null}
      <label htmlFor={`texte-${prefixe}`} className="text-sm font-semibold text-noir">
        Votre témoignage
      </label>
      <textarea
        id={`texte-${prefixe}`}
        name="texte"
        rows={5}
        required
        maxLength={1000}
        defaultValue={existant?.texte}
        placeholder="Ce qui vous a parlé, ce que le parcours vous apporte…"
        className="min-h-11 w-full rounded-md border border-black/25 bg-white px-3 py-2 text-base font-semibold text-noir placeholder:font-normal placeholder:text-doux"
      />
      <p className="text-xs">1 000 caractères au maximum.</p>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-semibold text-noir">Qui peut le voir ?</legend>
        {CHOIX.map((c) => (
          <label key={c.valeur} className="flex min-h-11 cursor-pointer items-start gap-2.5 py-1">
            <input
              type="radio"
              name="visibilite"
              value={c.valeur}
              defaultChecked={existant ? (c.valeur === "partage") === existant.partage : c.valeur === "prive"}
              className="mt-0.5 size-5 shrink-0 accent-accent"
            />
            <span>
              <span className="block text-sm font-semibold text-noir">{c.libelle}</span>
              <span className="block text-xs">{c.aide}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <MessageFormulaire ok={etat.ok} message={etat.message} />
      <button type="submit" disabled={enCours} className="btn btn-principal w-fit disabled:opacity-60">
        {enCours ? "Enregistrement…" : existant ? "Mettre à jour" : "Enregistrer"}
      </button>
    </form>
  );
}
