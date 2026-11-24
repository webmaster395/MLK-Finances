import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { GestionTemoignages } from "@/components/admin/temoignages";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Témoignages — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/temoignages">) {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Témoignages" sousTitre="Valider les témoignages partagés par les participants" />
      <Suspense fallback={<ChargementPage />}>
        <GestionTemoignages searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
