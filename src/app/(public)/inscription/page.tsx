import type { Metadata } from "next";
import { CarteAuth } from "@/components/auth/carte-auth";
import { FormulaireInscription } from "@/components/auth/formulaire-inscription";

export const metadata: Metadata = { title: "Inscription" };

export default function Page() {
  return (
    <CarteAuth titre="Inscription" sousTitre="Créez votre compte participant">
      <FormulaireInscription />
    </CarteAuth>
  );
}
