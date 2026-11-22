import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { FicheGroupe } from "@/components/admin/groupes";

export const metadata: Metadata = { title: "Groupe — Administration" };

export default function Page({ params }: PageProps<"/admin/groupes/[id]">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Fiche params={params} />
    </Suspense>
  );
}

async function Fiche({ params }: { params: PageProps<"/admin/groupes/[id]">["params"] }) {
  const { id } = await params;
  return <FicheGroupe id={id} />;
}
