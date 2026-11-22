import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeSeances } from "@/components/admin/seances";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Séances — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Séances" sousTitre="Calendrier de la promotion" />
      <Suspense fallback={<ChargementListe />}>
        <ListeSeances />
      </Suspense>
    </div>
  );
}
