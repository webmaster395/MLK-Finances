import Link from "next/link";
import { CalendarX } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-6">
      <EtatVide
        icone={CalendarX}
        titre="Session introuvable"
        texte="Cette session n'existe pas, ou elle ne fait pas partie de votre parcours."
      />
      <Link href="/sessions" className="btn btn-orange w-fit">
        Voir toutes les sessions
      </Link>
    </div>
  );
}
