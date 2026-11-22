import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeDevoirs } from "@/components/admin/devoirs";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Devoirs — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Devoirs" sousTitre="Consignes, rendus et corrections" />
      <Suspense fallback={<ChargementListe />}>
        <ListeDevoirs />
      </Suspense>
    </div>
  );
}
