import Link from "next/link";
import { BookOpen } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide icone={BookOpen} titre="Cours introuvable" texte="Ce cours n'existe pas ou a été supprimé." />
      <Link href="/admin/cours" className="btn btn-principal w-fit">
        Voir tous les cours
      </Link>
    </div>
  );
}
