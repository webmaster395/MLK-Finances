import type { Metadata } from "next";
import { Suspense } from "react";
import { TableauDeBordAdmin, TableauDeBordChargement } from "@/components/admin/tableau-de-bord";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Administration" sousTitre="Tableau de bord" />
      <Suspense fallback={<TableauDeBordChargement />}>
        <TableauDeBordAdmin />
      </Suspense>
    </div>
  );
}
