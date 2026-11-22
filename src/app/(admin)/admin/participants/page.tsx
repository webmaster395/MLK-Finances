import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeParticipants } from "@/components/admin/participants";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Participants — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Participants" sousTitre="Toutes les personnes inscrites" />
      <Suspense fallback={<ChargementListe />}>
        <ListeParticipants />
      </Suspense>
    </div>
  );
}
