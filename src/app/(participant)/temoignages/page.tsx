import type { Metadata } from "next";
import { Suspense } from "react";
import { ListeTemoignages, ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";

export const metadata: Metadata = { title: "Témoignages" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      {/* Les données de la personne sont lues sous <Suspense>. */}
      <Suspense fallback={<ListeTemoignagesChargement />}>
        <ListeTemoignages />
      </Suspense>
    </div>
  );
}
