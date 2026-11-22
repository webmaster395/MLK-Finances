"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { MessageFormulaire } from "@/components/auth/champ";
import { enregistrerPhotoTemoignage } from "@/lib/admin/actions";
import { cheminPhotoTemoignage, verifierPhotoTemoignage } from "@/lib/admin/validation";
import { creerClientNavigateur } from "@/lib/supabase/navigateur";

/**
 * Photo d'un témoignage : le navigateur l'envoie DIRECTEMENT au stockage (dossier « temoignages/ »,
 * réservé aux admins), puis une action serveur vérifie sa présence et enregistre le chemin.
 */
export function EnvoiPhotoTemoignage({ temoignageId, remplacement }: { temoignageId: string; remplacement: boolean }) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [enCours, setEnCours] = useState(false);
  const [retour, setRetour] = useState<{ ok?: boolean; message?: string }>({});

  async function surEnvoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fichier = champ.current?.files?.[0];
    if (!fichier) return setRetour({ message: "Choisissez une photo." });
    const probleme = verifierPhotoTemoignage(fichier);
    if (probleme) return setRetour({ message: probleme });

    setEnCours(true);
    setRetour({});
    try {
      const { error } = await creerClientNavigateur()
        .storage.from("photos")
        .upload(cheminPhotoTemoignage(temoignageId), fichier, { upsert: true, contentType: fichier.type });
      if (error) return setRetour({ message: "L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez." });
      const resultat = await enregistrerPhotoTemoignage(temoignageId);
      setRetour(resultat);
      if (resultat.ok) {
        if (champ.current) champ.current.value = "";
        router.refresh();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={surEnvoi} className="flex flex-col gap-2" noValidate>
      <MessageFormulaire ok={retour.ok} message={retour.message} />
      <label htmlFor={`photo-${temoignageId}`} className="text-sm font-semibold text-noir">
        {remplacement ? "Remplacer la photo" : "Ajouter une photo"}
      </label>
      <input
        ref={champ}
        id={`photo-${temoignageId}`}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={enCours}
        className="w-full rounded-md border border-black/25 bg-white p-2 text-sm font-semibold text-noir file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-rose-clair file:px-4 file:py-2 file:font-semibold file:text-noir"
      />
      <p className="text-xs">JPG, PNG ou WebP, 2 Mo maximum.</p>
      <button type="submit" disabled={enCours} className="inline-flex min-h-10 w-fit items-center gap-2 rounded-[0.6rem] border border-black/25 px-4 text-sm font-semibold text-noir hover:bg-black/5 disabled:opacity-60">
        <Upload aria-hidden className="size-4" />
        {enCours ? "Envoi en cours…" : remplacement ? "Remplacer" : "Ajouter"}
      </button>
    </form>
  );
}
