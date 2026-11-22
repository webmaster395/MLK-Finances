import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeCours } from "@/components/admin/cours";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Cours — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/cours">) {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Cours" sousTitre="Contenus et supports" />
      <Suspense fallback={<ChargementListe />}>
        <Liste searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Liste({ searchParams }: { searchParams: PageProps<"/admin/cours">["searchParams"] }) {
  const { groupe } = await searchParams;
  return <ListeCours groupeId={typeof groupe === "string" ? groupe : undefined} />;
}
