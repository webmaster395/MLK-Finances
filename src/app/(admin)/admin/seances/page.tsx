import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeSeances } from "@/components/admin/seances";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Sessions — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage surtitre="ADMINISTRATION" titre="Sessions" sousTitre="Les sessions du parcours, leur contenu et leurs documents" />
      <Suspense fallback={<ChargementListe />}>
        <ListeSeances />
      </Suspense>
    </div>
  );
}
