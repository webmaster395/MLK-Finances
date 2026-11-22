import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { NouvelleSeance } from "@/components/admin/seances";

export const metadata: Metadata = { title: "Nouvelle séance — Administration" };

export default function Page() {
  return (
    <Suspense fallback={<ChargementPage />}>
      <NouvelleSeance />
    </Suspense>
  );
}
