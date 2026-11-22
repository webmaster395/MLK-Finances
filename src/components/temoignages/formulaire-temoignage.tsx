"use client";

import { startTransition, useActionState } from "react";
import { MessageFormulaire } from "@/components/auth/champ";
import { envoyerTemoignage, retirerMonTemoignage, type EtatTemoignage } from "@/lib/temoignages-actions";

const etatInitial: EtatTemoignage = {};

/**
 * Formulaire « Mon témoignage » : écrire, corriger ou retirer (tant qu'il n'est pas validé).
 * L'envoi passe par onSubmit : React ne vide pas le champ, une saisie refusée reste à l'écran.
 */
export function FormulaireTemoignage({ texte, enAttente }: { texte: string; enAttente: boolean }) {
  const [etat, envoyer, enCours] = useActionState(envoyerTemoignage, etatInitial);
  const [etatRetrait, retirer, retraitEnCours] = useActionState(() => retirerMonTemoignage(), etatInitial);

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const donnees = new FormData(e.currentTarget);
          startTransition(() => envoyer(donnees));
        }}
        className="flex flex-col gap-3"
      >
        <MessageFormulaire ok={etat.ok} message={etat.message} />
        <label htmlFor="texte-temoignage" className="text-sm font-semibold text-noir">
          Votre témoignage
        </label>
        <textarea
          id="texte-temoignage"
          name="texte"
          rows={5}
          required
          maxLength={1000}
          defaultValue={texte}
          placeholder="Ce que le parcours vous a apporté, en quelques phrases…"
          aria-describedby="aide-temoignage"
          className="min-h-11 w-full rounded-md border border-black/25 bg-white px-3 py-2 text-base font-semibold text-noir placeholder:font-normal placeholder:text-black/40"
        />
        <p id="aide-temoignage" className="text-xs">
          1 000 caractères au maximum. L&apos;équipe le relit avant de le publier.
        </p>
        <button type="submit" disabled={enCours} className="btn btn-orange w-fit disabled:opacity-60">
          {enCours ? "Envoi…" : enAttente ? "Mettre à jour" : "Envoyer mon témoignage"}
        </button>
      </form>

      {enAttente ? (
        <div className="flex flex-col gap-2 border-t border-black/10 pt-3">
          <MessageFormulaire ok={etatRetrait.ok} message={etatRetrait.ok ? undefined : etatRetrait.message} />
          <button
            type="button"
            disabled={retraitEnCours}
            onClick={() => {
              if (window.confirm("Retirer votre témoignage ? Il ne sera pas publié.")) startTransition(() => retirer());
            }}
            className="inline-flex min-h-10 w-fit items-center rounded-[0.6rem] border border-[#b42318]/40 px-4 text-sm font-semibold text-[#b42318] hover:bg-[#b42318]/10 disabled:opacity-60"
          >
            {retraitEnCours ? "Retrait…" : "Retirer mon témoignage"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
