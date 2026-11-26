import type { Metadata } from "next";
import { Suspense } from "react";
import { TableauDeBordAdmin, TableauDeBordChargement } from "@/components/admin/tableau-de-bord";

export const metadata: Metadata = { title: "Administration" };

export default function Page() {
  return (
    <Suspense fallback={<TableauDeBordChargement />}>
      <TableauDeBordAdmin />
    </Suspense>
  );
}
