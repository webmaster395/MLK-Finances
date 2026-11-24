import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide icone={ClipboardList} titre="Devoir introuvable" texte="Ce devoir n'existe pas ou a été supprimé." />
      <Link href="/admin/devoirs" className="btn btn-principal w-fit">
        Voir tous les devoirs
      </Link>
    </div>
  );
}
