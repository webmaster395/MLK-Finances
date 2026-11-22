import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { FicheDevoir } from "@/components/admin/devoirs";

export const metadata: Metadata = { title: "Devoir — Administration" };

export default function Page({ params, searchParams }: PageProps<"/admin/devoirs/[id]">) {
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
  params: PageProps<"/admin/devoirs/[id]">["params"];
  searchParams: PageProps<"/admin/devoirs/[id]">["searchParams"];
}) {
  const [{ id }, { cree, erreur }] = await Promise.all([params, searchParams]);
  return <FicheDevoir id={id} cree={cree === "1"} erreurFichier={erreur === "fichier"} />;
}
