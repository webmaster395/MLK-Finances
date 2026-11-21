import type { Metadata } from "next";
import { Suspense } from "react";
import { CarteAuth, CarteAuthChargement } from "@/components/auth/carte-auth";
import { FormulaireConnexion } from "@/components/auth/formulaire-connexion";
import { cheminSur } from "@/lib/auth/redirection";

export const metadata: Metadata = { title: "Connexion" };

export default function Page({ searchParams }: PageProps<"/connexion">) {
  // Les paramètres de l'adresse sont lus à chaque requête : sous <Suspense> (Cache Components)
  return (
    <Suspense fallback={<CarteAuthChargement />}>
      <Contenu searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const parametres = await searchParams;
  const brut = parametres.suivant;
  // Page de retour demandée : acceptée seulement si c'est un chemin interne du site
  const suivant = typeof brut === "string" ? cheminSur(brut, "") : "";
  const lienInvalide = parametres.erreur === "lien";

  return (
    <CarteAuth titre="Connexion" sousTitre="Bienvenue dans votre parcours">
      <FormulaireConnexion suivant={suivant || undefined} lienInvalide={lienInvalide} />
    </CarteAuth>
  );
}
