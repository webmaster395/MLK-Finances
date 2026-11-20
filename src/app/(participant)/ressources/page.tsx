import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Ressources" };

export default function Page() {
  return (
    <PageVide
      titre="Ressources"
      sousTitre="Documents et liens pour aller plus loin"
      icone={FolderOpen}
      contenu="Les supports de cours classés par module apparaîtront ici."
      lot="lot 7"
    />
  );
}
