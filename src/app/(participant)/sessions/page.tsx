import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeSessions, ListeSessionsChargement } from "@/components/sessions/liste-sessions";

export const metadata: Metadata = { title: "Sessions" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Sessions" sousTitre="Le calendrier de votre parcours" />
      {/* La liste lit les données de la personne : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeSessionsChargement />}>
        <ListeSessions />
      </Suspense>
    </div>
  );
}
