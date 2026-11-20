import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Cours" };

export default function Page() {
  return (
    <PageVide
      titre="Cours"
      sousTitre="Les modules de votre parcours"
      icone={BookOpen}
      contenu="Les modules, leurs objectifs et leurs séances apparaîtront ici."
      lot="lot 6"
    />
  );
}
