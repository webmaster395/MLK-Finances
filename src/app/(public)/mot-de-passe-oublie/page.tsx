import type { Metadata } from "next";
import { CarteAuth } from "@/components/auth/carte-auth";
import { FormulaireOubli } from "@/components/auth/formulaire-oubli";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Page() {
  return (
    <CarteAuth titre="Mot de passe oublié" sousTitre="Nous vous envoyons un lien par e-mail">
      <FormulaireOubli />
    </CarteAuth>
  );
}
