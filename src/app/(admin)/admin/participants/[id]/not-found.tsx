import Link from "next/link";
import { UserRound } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide icone={UserRound} titre="Participant introuvable" texte="Cette personne n'existe pas ou son compte a été supprimé." />
      <Link href="/admin/participants" className="btn btn-principal w-fit">
        Voir tous les participants
      </Link>
    </div>
  );
}
