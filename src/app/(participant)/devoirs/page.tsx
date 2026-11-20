import type { Metadata } from "next";
import { FilePen } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Devoirs" };

export default function Page() {
  return (
    <PageVide
      titre="Devoirs"
      sousTitre="Votre travail à rendre"
      icone={FilePen}
      contenu="Vos devoirs, leur date limite et le dépôt de vos fichiers apparaîtront ici."
      lot="lot 8"
    />
  );
}
