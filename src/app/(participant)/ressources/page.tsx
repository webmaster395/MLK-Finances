import type { Metadata } from "next";
import { Suspense } from "react";
import { ListeRessources, ListeRessourcesChargement } from "@/components/ressources/liste-ressources";

export const metadata: Metadata = { title: "Ressources" };

export default function Page({ searchParams }: PageProps<"/ressources">) {
  return (
    <div className="flex flex-col gap-6">
      {/* Les données de la personne et les paramètres de l'adresse sont lus à chaque requête : sous <Suspense>. */}
      <Suspense fallback={<ListeRessourcesChargement />}>
        <Contenu searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contenu({ searchParams }: { searchParams: PageProps<"/ressources">["searchParams"] }) {
  const parametres = await searchParams;
  return <ListeRessources erreurFichier={parametres.erreur === "fichier"} />;
}
