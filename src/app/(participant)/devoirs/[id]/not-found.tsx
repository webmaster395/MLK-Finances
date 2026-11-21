import Link from "next/link";
import { ClipboardX } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide
        icone={ClipboardX}
        titre="Devoir introuvable"
        texte="Ce devoir n'existe pas, ou il ne fait pas partie de votre parcours."
      />
      <Link href="/devoirs" className="btn btn-orange w-fit">
        Voir tous les devoirs
      </Link>
    </div>
  );
}
