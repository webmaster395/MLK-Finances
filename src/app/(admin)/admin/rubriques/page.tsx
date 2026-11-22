import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { GestionRubriques } from "@/components/admin/rubriques";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Rubriques — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Rubriques" sousTitre="Types de séances et leurs couleurs" />
      <Suspense fallback={<ChargementPage />}>
        <GestionRubriques />
      </Suspense>
    </div>
  );
}
