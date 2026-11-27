"use client";

import { startTransition, useActionState, useEffect, useRef, type ReactNode } from "react";
import { MessageFormulaire } from "@/components/auth/champ";
import type { EtatAdmin } from "@/lib/admin/actions";

type Props = {
  action: (etat: EtatAdmin, formData: FormData) => Promise<EtatAdmin>;
  /** Champs du formulaire (dont les champs cachés). */
  children: ReactNode;
  /** Contenu du bouton (texte ou icône), et texte pendant l'envoi. */
  bouton: ReactNode;
  enCoursTexte?: string;
  /** Style du bouton : principal, secondaire (bordure), danger (rouge discret) ou icône rouge. */
  style?: "principal" | "secondaire" | "danger" | "icone-danger";
  /** Nom du bouton quand il ne montre qu'une icône. */
  etiquette?: string;
  /** Demande une confirmation avant l'envoi. */
  confirmation?: string;
  className?: string;
  /** Affiche le message de réussite (false pour un petit bouton de ligne : seules les erreurs s'affichent). */
  afficherSucces?: boolean;
  /** Vide les champs après une réussite (formulaire de création qui reste sur la page). */
  viderApresSucces?: boolean;
};

const STYLES = {
  principal: "btn btn-principal w-fit disabled:opacity-60",
  secondaire:
    "inline-flex min-h-10 w-fit items-center rounded-[0.6rem] border border-black/25 px-4 text-sm font-semibold text-noir hover:bg-black/5 disabled:opacity-60",
  danger:
    "inline-flex min-h-10 w-fit items-center rounded-[0.6rem] border border-[#b42318]/40 px-4 text-sm font-semibold text-[#b42318] hover:bg-[#b42318]/10 disabled:opacity-60",
  "icone-danger": "flex size-11 items-center justify-center rounded-[0.9rem] text-[#b42318] hover:bg-[#b42318]/10 disabled:opacity-60",
};

/**
 * Formulaire de l'espace admin : envoie une action serveur et affiche son message.
 * L'envoi passe par onSubmit (et non par l'attribut action) : ainsi React ne vide pas les champs,
 * et une saisie refusée reste à l'écran pour être corrigée.
 */
export function FormulaireAction({
  action,
  children,
  bouton,
  enCoursTexte,
  style = "principal",
  confirmation,
  etiquette,
  className = "",
  afficherSucces = true,
  viderApresSucces = false,
}: Props) {
  const [etat, envoyer, enCours] = useActionState(action, {});
  const formulaire = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (etat.ok && viderApresSucces) formulaire.current?.reset();
  }, [etat, viderApresSucces]);

  return (
    <form
      ref={formulaire}
      onSubmit={(e) => {
        e.preventDefault();
        if (confirmation && !window.confirm(confirmation)) return;
        const donnees = new FormData(e.currentTarget);
        startTransition(() => envoyer(donnees));
      }}
      className={`flex flex-col gap-3 ${className}`}
    >
      {etat.ok && !afficherSucces ? null : <MessageFormulaire ok={etat.ok} message={etat.message} />}
      {children}
      <button type="submit" disabled={enCours} aria-label={etiquette} title={etiquette} className={STYLES[style]}>
        {enCours ? (enCoursTexte ?? "Enregistrement…") : bouton}
      </button>
    </form>
  );
}
