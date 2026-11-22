import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeSeances } from "@/components/admin/seances";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Séances — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/seances">) {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Séances" sousTitre="Calendrier des groupes" />
      <Suspense fallback={<ChargementListe />}>
        <Liste searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Liste({ searchParams }: { searchParams: PageProps<"/admin/seances">["searchParams"] }) {
  const { groupe } = await searchParams;
  return <ListeSeances groupeId={typeof groupe === "string" ? groupe : undefined} />;
}
