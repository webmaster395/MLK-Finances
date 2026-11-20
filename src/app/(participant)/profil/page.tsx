import type { Metadata } from "next";
import { User } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Profil" };

export default function Page() {
  return (
    <PageVide
      titre="Profil"
      sousTitre="Vos informations"
      icone={User}
      contenu="Votre photo, vos informations personnelles et votre formation apparaîtront ici."
      lot="lot 10"
    />
  );
}
