import type { Metadata } from "next";
import { Suspense } from "react";
import { ListeGroupes, NouveauGroupe } from "@/components/admin/groupes";
import { ChargementListe } from "@/components/admin/chargement";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Groupes — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Groupes" sousTitre="Promotions et rattachements" />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <Suspense fallback={<ChargementListe />}>
          <ListeGroupes />
        </Suspense>
        <NouveauGroupe />
      </div>
    </div>
  );
}
