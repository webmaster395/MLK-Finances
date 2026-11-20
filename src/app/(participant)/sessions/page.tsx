import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { PageVide } from "@/components/coquille/page-vide";

export const metadata: Metadata = { title: "Sessions" };

export default function Page() {
  return (
    <PageVide
      titre="Sessions"
      sousTitre="Le calendrier de votre parcours"
      icone={CalendarDays}
      contenu="La liste de vos sessions, avec les dates et les lieux, apparaîtra ici."
      lot="lot 5"
    />
  );
}
