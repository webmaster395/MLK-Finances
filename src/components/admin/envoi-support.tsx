"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { MessageFormulaire } from "@/components/auth/champ";
import { enregistrerFichierSupport, preparerFichierSupport } from "@/lib/admin/actions";
import { estPdf, SUPPORT_TAILLE_MAX_OCTETS } from "@/lib/admin/validation";
import { creerClientNavigateur } from "@/lib/supabase/navigateur";

/**
 * Ajout d'un document PDF à une session, en trois temps :
 * 1. le serveur choisit le chemin du fichier ;
 * 2. le navigateur envoie le fichier DIRECTEMENT au stockage (règles « admin » du seau) ;
 * 3. le serveur vérifie que le fichier est arrivé et enregistre le document.
 * Aucun fichier ne passe par le serveur du site.
 */
export function EnvoiSupport({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const champ = useRef<HTMLInputElement>(null);
  const [titre, setTitre] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [retour, setRetour] = useState<{ ok?: boolean; message?: string }>({});

  async function surEnvoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fichier = champ.current?.files?.[0];
    if (!titre.trim()) return setRetour({ message: "Donnez un titre au document." });
    if (!fichier) return setRetour({ message: "Choisissez un fichier." });
    if (!estPdf(fichier)) return setRetour({ message: "Seuls les documents PDF sont acceptés. Pour une présentation Canva, ajoutez plutôt son lien." });
    if (fichier.size === 0) return setRetour({ message: "Ce fichier est vide." });
    if (fichier.size > SUPPORT_TAILLE_MAX_OCTETS) return setRetour({ message: "Ce fichier dépasse 50 Mo." });

    setEnCours(true);
    setRetour({});
    try {
      const preparation = await preparerFichierSupport(sessionId, fichier.name, fichier.type);
      if (!preparation.ok) return setRetour({ message: preparation.message });

      const { error } = await creerClientNavigateur()
        .storage.from("ressources")
        .upload(preparation.chemin, fichier, { contentType: "application/pdf" });
      if (error) return setRetour({ message: "L'envoi du fichier a échoué. Vérifiez votre connexion et réessayez." });

      const resultat = await enregistrerFichierSupport(sessionId, titre, preparation.chemin);
      setRetour(resultat);
      if (resultat.ok) {
        setTitre("");
        if (champ.current) champ.current.value = "";
        router.refresh();
      }
    } finally {
      setEnCours(false);
    }
  }

  return (
    <form onSubmit={surEnvoi} className="flex flex-col gap-3" noValidate>
      <MessageFormulaire ok={retour.ok} message={retour.message} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fichier-titre" className="text-sm font-semibold text-noir">
          Titre du document
        </label>
        <input
          id="fichier-titre"
          value={titre}
          onChange={(e) => setTitre(e.target.value)}
          maxLength={200}
          className="min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fichier-support" className="text-sm font-semibold text-noir">
          Fichier PDF
        </label>
        <input
          ref={champ}
          id="fichier-support"
          type="file"
          accept="application/pdf,.pdf"
          disabled={enCours}
          aria-describedby="fichier-support-aide"
          className="w-full rounded-md border border-black/25 bg-white p-2 text-sm font-semibold text-noir file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-accent-clair file:px-4 file:py-2 file:font-semibold file:text-noir"
        />
        <p id="fichier-support-aide" className="text-xs">
          PDF uniquement, 50 Mo maximum.
        </p>
      </div>
      <button type="submit" disabled={enCours} className="btn btn-principal w-fit gap-2 disabled:opacity-60">
        <Upload aria-hidden className="size-4" />
        {enCours ? "Envoi en cours…" : "Ajouter le PDF"}
      </button>
    </form>
  );
}
