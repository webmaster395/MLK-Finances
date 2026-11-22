import Link from "next/link";
import { Users } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide icone={Users} titre="Groupe introuvable" texte="Ce groupe n'existe pas ou a été supprimé." />
      <Link href="/admin/groupes" className="btn btn-orange w-fit">
        Voir tous les groupes
      </Link>
    </div>
  );
}
