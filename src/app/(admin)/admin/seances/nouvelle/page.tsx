import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { NouvelleSeance } from "@/components/admin/seances";

export const metadata: Metadata = { title: "Nouvelle séance — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/seances/nouvelle">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Formulaire searchParams={searchParams} />
    </Suspense>
  );
}

async function Formulaire({ searchParams }: { searchParams: PageProps<"/admin/seances/nouvelle">["searchParams"] }) {
  const { groupe } = await searchParams;
  return <NouvelleSeance groupeId={typeof groupe === "string" ? groupe : undefined} />;
}
