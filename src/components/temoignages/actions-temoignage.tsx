"use client";

import { startTransition, useActionState, useState } from "react";
import { Pencil, Share2, Trash2, X } from "lucide-react";
import { MessageFormulaire } from "@/components/auth/champ";
import { partagerMonTemoignage, retirerMonTemoignage, type EtatTemoignage } from "@/lib/temoignages-actions";
import { FormulaireTemoignage } from "./formulaire-temoignage";

const etatInitial: EtatTemoignage = {};
const ICONE = "flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] disabled:opacity-60";

/** Actions d'un témoignage non validé : proposer à tous (note privée), puis modifier et supprimer en icônes. */
export function ActionsTemoignage({ id, texte, partage, sessionId }: { id: string; texte: string; partage: boolean; sessionId: string }) {
  const [modification, setModification] = useState(false);
  const [etatPartage, partager, partageEnCours] = useActionState(() => partagerMonTemoignage(id), etatInitial);
  const [etatRetrait, retirer, retraitEnCours] = useActionState(() => retirerMonTemoignage(id), etatInitial);
  const erreur = [etatPartage, etatRetrait].find((e) => e.message && !e.ok)?.message;

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-black/10 pt-3">
      <MessageFormulaire message={erreur} />
      <div className="flex items-center gap-1">
        {partage ? (
          <p className="text-sm text-doux">L&apos;équipe va le relire.</p>
        ) : (
          <button
            type="button"
            disabled={partageEnCours}
            onClick={() => {
              if (window.confirm("Proposer ce témoignage à tous les participants ? L'équipe le valide avant qu'il apparaisse.")) {
                startTransition(() => partager());
              }
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-[0.9rem] border border-black/25 px-4 text-sm font-semibold text-accent hover:bg-black/5 disabled:opacity-60"
          >
            <Share2 aria-hidden className="size-4" />
            {partageEnCours ? "Envoi…" : "Proposer à tous"}
          </button>
        )}
        <button
          type="button"
          onClick={() => setModification((v) => !v)}
          aria-expanded={modification}
          aria-label={modification ? "Fermer la modification" : "Modifier ce témoignage"}
          title={modification ? "Fermer" : "Modifier"}
          className={`${ICONE} ml-auto text-noir hover:bg-black/5`}
        >
          {modification ? <X aria-hidden className="size-5" /> : <Pencil aria-hidden className="size-5" />}
        </button>
        <button
          type="button"
          disabled={retraitEnCours}
          aria-label="Supprimer ce témoignage"
          title="Supprimer"
          onClick={() => {
            if (window.confirm("Supprimer définitivement ce témoignage ?")) startTransition(() => retirer());
          }}
          className={`${ICONE} text-[#b42318] hover:bg-[#b42318]/10`}
        >
          <Trash2 aria-hidden className="size-5" />
        </button>
      </div>
      {modification ? <FormulaireTemoignage existant={{ id, texte, partage, sessionId }} /> : null}
    </div>
  );
}
