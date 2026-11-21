import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeCours, ListeCoursChargement } from "@/components/cours/liste-cours";

export const metadata: Metadata = { title: "Cours" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Cours" sousTitre="Les modules de votre parcours" />
      {/* La liste lit les données de la personne : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeCoursChargement />}>
        <ListeCours />
      </Suspense>
    </div>
  );
}
