import type { Metadata } from "next";
import { House } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Accueil" };

export default function Page() {
  return (
    <PageVide
      titre="Accueil"
      sousTitre="Bienvenue dans votre parcours"
      icone={House}
      contenu="Votre prochaine session, vos devoirs à rendre et les accès rapides apparaîtront ici."
      lot="lot 4"
    />
  );
}
