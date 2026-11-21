import type { Metadata } from "next";
import { Suspense } from "react";
import { CarteSession, CarteSessionChargement } from "@/components/accueil/carte-session";
import { HeroAccueil } from "@/components/accueil/hero-accueil";
import { TemoignagesAccueil } from "@/components/accueil/temoignages-accueil";
import { TuilesAccueil } from "@/components/accueil/tuiles-accueil";

export const metadata: Metadata = { title: "Accueil" };

export default function Page() {
  return (
    <div className="flex flex-col gap-2">
      <HeroAccueil />
      {/* Seule cette carte lit les données de la personne : le reste de la page est statique. */}
      <Suspense fallback={<CarteSessionChargement />}>
        <CarteSession />
      </Suspense>
      <TuilesAccueil />
      <TemoignagesAccueil />
    </div>
  );
}
