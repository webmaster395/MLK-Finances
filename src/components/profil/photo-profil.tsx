"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import { cheminPhoto, PHOTO_TAILLE_MAX_OCTETS, PHOTO_TYPES, verifierPhoto } from "@/lib/auth/profil";
import { enregistrerPhoto, supprimerPhoto } from "@/lib/profil-actions";
import { creerClientNavigateur } from "@/lib/supabase/navigateur";
import { Avatar } from "./avatar";

/**
 * Photo de profil. Le fichier part du navigateur DIRECTEMENT vers le stockage Supabase
 * (dossier de la personne uniquement), puis une action serveur enregistre le chemin.
 */
export function PhotoProfil({
  participantId,
  photoUrl,
  initiales,
}: {
  participantId: string;
  photoUrl: string | null;
  initiales: string;
}) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function surChoix() {
    const fichier = champ.current?.files?.[0];
    if (!fichier) return;
    const probleme = verifierPhoto(fichier);
    if (probleme) {
      if (champ.current) champ.current.value = "";
      return setErreur(probleme);
    }

    setErreur(null);
    setOccupe(true);
    const supabase = creerClientNavigateur();
    const { error } = await supabase.storage
      .from("photos")
      .upload(cheminPhoto(participantId), fichier, { upsert: true, contentType: fichier.type });
    if (error) {
      setOccupe(false);
      return setErreur("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.");
    }
    const resultat = await enregistrerPhoto();
    setOccupe(false);
    if (champ.current) champ.current.value = "";
    if (!resultat.ok) return setErreur(resultat.message ?? "La photo n'a pas pu être enregistrée.");
    router.refresh();
  }

  async function surSuppression() {
    setErreur(null);
    setOccupe(true);
    const resultat = await supprimerPhoto();
    setOccupe(false);
    if (!resultat.ok) return setErreur(resultat.message ?? "La photo n'a pas pu être supprimée.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Avatar photoUrl={photoUrl} initiales={initiales} taille="size-28" texteTaille="text-5xl" />
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <label
            className={`btn btn-accent min-h-10 cursor-pointer gap-2 px-4 text-sm ${occupe ? "pointer-events-none opacity-60" : ""}`}
          >
            <Camera aria-hidden className="size-4" />
            {occupe ? "Envoi en cours…" : photoUrl ? "Changer ma photo" : "Ajouter une photo"}
            <input
              ref={champ}
              type="file"
              accept={PHOTO_TYPES.join(",")}
              onChange={surChoix}
              disabled={occupe}
              className="sr-only"
              aria-label="Choisir une photo de profil"
            />
          </label>
          {photoUrl ? (
            <button
              type="button"
              onClick={surSuppression}
              disabled={occupe}
              className="flex min-h-10 items-center gap-2 rounded-md border border-black/25 bg-white px-4 text-sm font-semibold text-noir hover:bg-black/5 disabled:opacity-60"
            >
              <Trash2 aria-hidden className="size-4" />
              Supprimer
            </button>
          ) : null}
        </div>
        <p className="text-xs">JPG, PNG ou WebP, {PHOTO_TAILLE_MAX_OCTETS / (1024 * 1024)} Mo maximum.</p>
        {erreur ? (
          <p role="alert" className="rounded-md bg-orange/15 px-3 py-2 text-sm font-semibold text-[#8f3306]">
            {erreur}
          </p>
        ) : null}
      </div>
    </div>
  );
}
