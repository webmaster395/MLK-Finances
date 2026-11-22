import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { NouveauCours } from "@/components/admin/cours";

export const metadata: Metadata = { title: "Nouveau cours — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/cours/nouveau">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Formulaire searchParams={searchParams} />
    </Suspense>
  );
}

async function Formulaire({ searchParams }: { searchParams: PageProps<"/admin/cours/nouveau">["searchParams"] }) {
  const { groupe } = await searchParams;
  return <NouveauCours groupeId={typeof groupe === "string" ? groupe : undefined} />;
}
