import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeTemoignages, ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";

export const metadata: Metadata = { title: "Témoignages" };

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <TitrePage titre="Témoignages" sousTitre="Votre journal et les paroles partagées" />
      {/* Les données de la personne sont lues sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeTemoignagesChargement />}>
        <ListeTemoignages />
      </Suspense>
    </div>
  );
}
