import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { NouveauCours } from "@/components/admin/cours";

export const metadata: Metadata = { title: "Nouveau cours — Administration" };

export default function Page() {
  return (
    <Suspense fallback={<ChargementPage />}>
      <NouveauCours />
    </Suspense>
  );
}
