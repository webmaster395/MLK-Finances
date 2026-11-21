"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { CircleCheck, Upload } from "lucide-react";
import { enregistrerRendu } from "@/lib/devoirs-actions";
import { LISTE_TYPES_LISIBLE, TAILLE_MAX_OCTETS, cheminRendu, verifierFichier } from "@/lib/devoirs";
import { creerClientNavigateur } from "@/lib/supabase/navigateur";

type Etat = "attente" | "envoi" | "fait";

/**
 * Dépôt d'un fichier. Le fichier part du navigateur DIRECTEMENT vers le stockage Supabase
 * (qui applique ses règles : dossier de la personne, devoir visible, devoir non corrigé),
 * puis une action serveur enregistre le rendu. Aucun fichier ne passe par le serveur du site.
 */
export function FormulaireDepot({
  devoirId,
  participantId,
  remplacement,
}: {
  devoirId: string;
  participantId: string;
  /** true si un fichier a déjà été déposé (le nouveau dépôt le remplacera). */
  remplacement: boolean;
}) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [etat, setEtat] = useState<Etat>("attente");
  const [erreur, setErreur] = useState<string | null>(null);
  const [nomChoisi, setNomChoisi] = useState<string | null>(null);

  function surChoix() {
    const fichier = champ.current?.files?.[0];
    setEtat("attente");
    setNomChoisi(fichier?.name ?? null);
    setErreur(fichier ? verifierFichier(fichier) : null);
  }

  async function surEnvoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fichier = champ.current?.files?.[0];
    if (!fichier) return setErreur("Choisissez d'abord un fichier.");
    const probleme = verifierFichier(fichier);
    if (probleme) return setErreur(probleme);

    setErreur(null);
    setEtat("envoi");

    const supabase = creerClientNavigateur();
    const { error } = await supabase.storage
      .from("rendus")
      .upload(cheminRendu(participantId, devoirId), fichier, { upsert: true, contentType: fichier.type });
    if (error) {
      setEtat("attente");
      return setErreur("L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez.");
    }

    const resultat = await enregistrerRendu(devoirId, fichier.name);
    if (!resultat.ok) {
      setEtat("attente");
      return setErreur(resultat.message ?? "Le dépôt n'a pas pu être enregistré.");
    }

    setEtat("fait");
    if (champ.current) champ.current.value = "";
    setNomChoisi(null);
    router.refresh();
  }

  return (
    <form onSubmit={surEnvoi} className="flex flex-col gap-4" noValidate>
      {etat === "fait" ? (
        <p role="status" className="flex items-start gap-3 rounded-md bg-rose-clair px-4 py-3 font-semibold text-noir">
          <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0" />
          Votre fichier a bien été déposé.
        </p>
      ) : null}
      {erreur ? (
        <p role="alert" className="rounded-md bg-orange/15 px-4 py-3 font-semibold text-[#8f3306]">
          {erreur}
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="fichier" className="text-sm font-semibold text-noir">
          {remplacement ? "Remplacer mon fichier" : "Choisir mon fichier"}
        </label>
        <input
          ref={champ}
          id="fichier"
          name="fichier"
          type="file"
          onChange={surChoix}
          disabled={etat === "envoi"}
          aria-describedby="aide-fichier"
          className="w-full rounded-md border border-black/25 bg-white p-2 text-sm font-semibold text-noir file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-rose-clair file:px-4 file:py-2 file:font-semibold file:text-noir"
        />
        <p id="aide-fichier" className="text-xs">
          {LISTE_TYPES_LISIBLE}. {TAILLE_MAX_OCTETS / (1024 * 1024)} Mo maximum.
          {remplacement ? " Le nouveau fichier remplacera le précédent." : ""}
        </p>
      </div>

      <button type="submit" disabled={etat === "envoi" || !nomChoisi || Boolean(erreur)} className="btn btn-orange w-fit gap-2 disabled:opacity-60">
        <Upload aria-hidden className="size-4" />
        {etat === "envoi" ? "Envoi en cours…" : remplacement ? "Remplacer le fichier" : "Déposer le fichier"}
      </button>
    </form>
  );
}
