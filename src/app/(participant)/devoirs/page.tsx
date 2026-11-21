import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeDevoirs, ListeDevoirsChargement } from "@/components/devoirs/liste-devoirs";

export const metadata: Metadata = { title: "Devoirs" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Devoirs" sousTitre="Votre travail à rendre" />
      {/* La liste lit les données de la personne : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeDevoirsChargement />}>
        <ListeDevoirs />
      </Suspense>
    </div>
  );
}
