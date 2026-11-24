"use client";

import { startTransition, useActionState, useRef } from "react";
import { MessageFormulaire } from "@/components/auth/champ";
import { envoyerTemoignage, modifierMonTemoignage, retirerMonTemoignage, type EtatTemoignage } from "@/lib/temoignages-actions";

const etatInitial: EtatTemoignage = {};

const CHOIX = [
  { valeur: "partage", libelle: "Je souhaite le partager avec les participants", aide: "Les administrateurs choisissent de l'afficher." },
  { valeur: "confidentiel", libelle: "Confidentiel : pour l'équipe ou un pasteur", aide: "Précisez dans votre texte à qui vous vous adressez." },
] as const;

/**
 * Écrire un nouveau témoignage, ou corriger l'un des siens tant qu'il n'est pas affiché.
 * L'envoi passe par onSubmit : React ne vide pas le champ, une saisie refusée reste à l'écran.
 */
export function FormulaireTemoignage({ existant }: { existant?: { id: string; texte: string; confidentiel: boolean } }) {
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
        <legend className="mb-1 text-sm font-semibold text-noir">À qui l&apos;adressez-vous ?</legend>
        {CHOIX.map((c) => (
          <label key={c.valeur} className="flex min-h-11 cursor-pointer items-start gap-2.5 py-1">
            <input
              type="radio"
              name="destinataire"
              value={c.valeur}
              defaultChecked={existant ? (c.valeur === "confidentiel") === existant.confidentiel : c.valeur === "partage"}
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
        {enCours ? "Envoi…" : existant ? "Mettre à jour" : "Envoyer mon témoignage"}
      </button>
    </form>
  );
}

/** Bouton « Retirer » d'un témoignage non affiché, avec confirmation. */
export function RetirerTemoignage({ id }: { id: string }) {
  const [etat, retirer, enCours] = useActionState(() => retirerMonTemoignage(id), etatInitial);

  return (
    <div className="flex flex-col gap-2">
      <MessageFormulaire ok={etat.ok} message={etat.ok ? undefined : etat.message} />
      <button
        type="button"
        disabled={enCours}
        onClick={() => {
          if (window.confirm("Retirer ce témoignage ? Il sera supprimé.")) startTransition(() => retirer());
        }}
        className="inline-flex min-h-10 w-fit items-center rounded-[0.6rem] border border-[#b42318]/40 px-4 text-sm font-semibold text-[#b42318] hover:bg-[#b42318]/10 disabled:opacity-60"
      >
        {enCours ? "Retrait…" : "Retirer"}
      </button>
    </div>
  );
}
