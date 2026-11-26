import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementListe } from "@/components/admin/chargement";
import { ListeParticipants } from "@/components/admin/participants";

export const metadata: Metadata = { title: "Participants — Administration" };

export default function Page({ searchParams }: PageProps<"/admin/participants">) {
  return (
    <div className="flex flex-col gap-5">
      <Suspense fallback={<ChargementListe />}>
        <ListeParticipants searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
