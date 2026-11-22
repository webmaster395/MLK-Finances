import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { NouveauDevoir } from "@/components/admin/devoirs";

export const metadata: Metadata = { title: "Nouveau devoir — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/devoirs/nouveau">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Formulaire searchParams={searchParams} />
    </Suspense>
  );
}

async function Formulaire({ searchParams }: { searchParams: PageProps<"/admin/devoirs/nouveau">["searchParams"] }) {
  const { cours } = await searchParams;
  return <NouveauDevoir coursId={typeof cours === "string" ? cours : undefined} />;
}
