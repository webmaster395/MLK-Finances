import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { FicheSeance } from "@/components/admin/seances";

export const metadata: Metadata = { title: "Séance — Administration" };

export default function Page({ params, searchParams }: PageProps<"/admin/seances/[id]">) {
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
  params: PageProps<"/admin/seances/[id]">["params"];
  searchParams: PageProps<"/admin/seances/[id]">["searchParams"];
}) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  return <FicheSeance id={id} creee={cree === "1"} />;
}
