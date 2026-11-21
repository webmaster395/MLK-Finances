import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeTemoignages, ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";

export const metadata: Metadata = { title: "Témoignages" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Témoignages" sousTitre="Les expériences des participants" />
      {/* La liste lit la base : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeTemoignagesChargement />}>
        <ListeTemoignages />
      </Suspense>
    </div>
  );
}
