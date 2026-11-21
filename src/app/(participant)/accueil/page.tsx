import type { Metadata } from "next";
import { Suspense } from "react";
import { JourneeAccueil, JourneeAccueilChargement } from "@/components/accueil/journee-accueil";
import { MessageEquipe, MessageEquipeChargement } from "@/components/accueil/message-equipe";
import { TravailAFaire, TravailAFaireChargement } from "@/components/accueil/travail-a-faire";

export const metadata: Metadata = { title: "Accueil" };

/**
 * Accueil : à gauche le déroulé de la prochaine journée ; à droite le message de l'équipe,
 * puis le travail à faire. Chaque bloc lit ses propres données : chacun a son <Suspense>.
 */
export default function Page() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
      <h1 className="sr-only">Accueil</h1>
      <Suspense fallback={<JourneeAccueilChargement />}>
        <JourneeAccueil />
      </Suspense>
      <div className="flex flex-col gap-4">
        <Suspense fallback={<MessageEquipeChargement />}>
          <MessageEquipe />
        </Suspense>
        <Suspense fallback={<TravailAFaireChargement />}>
          <TravailAFaire />
        </Suspense>
      </div>
    </div>
  );
}
