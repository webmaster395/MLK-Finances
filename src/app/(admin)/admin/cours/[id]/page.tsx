import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { FicheCours } from "@/components/admin/cours";

export const metadata: Metadata = { title: "Cours — Administration" };

export default function Page({ params, searchParams }: PageProps<"/admin/cours/[id]">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Fiche params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Fiche({
  params,
  searchParams,
}: {
  params: PageProps<"/admin/cours/[id]">["params"];
  searchParams: PageProps<"/admin/cours/[id]">["searchParams"];
}) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  return <FicheCours id={id} cree={cree === "1"} />;
}
