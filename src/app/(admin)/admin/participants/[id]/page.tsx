import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { FicheParticipant } from "@/components/admin/participants";

export const metadata: Metadata = { title: "Participant — Administration" };

export default function Page({ params }: PageProps<"/admin/participants/[id]">) {
  return (
    <Suspense fallback={<ChargementPage />}>
      <Fiche params={params} />
    </Suspense>
  );
}

async function Fiche({ params }: { params: PageProps<"/admin/participants/[id]">["params"] }) {
  const { id } = await params;
  return <FicheParticipant id={id} />;
}
