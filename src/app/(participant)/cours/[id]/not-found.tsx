import Link from "next/link";
import { BookX } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide
        icone={BookX}
        titre="Cours introuvable"
        texte="Ce cours n'existe pas, ou il ne fait pas partie de votre parcours."
      />
      <Link href="/sessions" className="btn btn-principal w-fit">
        Voir le calendrier
      </Link>
    </div>
  );
}
