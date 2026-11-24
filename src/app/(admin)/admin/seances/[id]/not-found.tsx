import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide icone={CalendarX} titre="Séance introuvable" texte="Cette séance n'existe pas ou a été supprimée." />
      <Link href="/admin/seances" className="btn btn-principal w-fit">
        Voir toutes les séances
      </Link>
    </div>
  );
}
