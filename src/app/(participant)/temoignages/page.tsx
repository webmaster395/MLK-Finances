import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Témoignages" };

export default function Page() {
  return (
    <PageVide
      titre="Témoignages"
      sousTitre="Les expériences des participants"
      icone={MessageCircle}
      contenu="Les témoignages des participants apparaîtront ici."
      lot="lot 9"
    />
  );
}
