import { JourneeAccueilChargement } from "@/components/accueil/journee-accueil";
import { MessageEquipeChargement } from "@/components/accueil/message-equipe";
import { TravailAFaireChargement } from "@/components/accueil/travail-a-faire";

/** Squelette de l'accueil : les mêmes blocs que la page, en gris. */
export default function Loading() {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,23rem)]">
      <JourneeAccueilChargement />
      <div className="flex flex-col gap-4">
        <MessageEquipeChargement />
        <TravailAFaireChargement />
      </div>
    </div>
  );
}
