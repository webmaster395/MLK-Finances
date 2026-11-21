import { TitrePage } from "@/components/coquille/titre-page";
import { ListeRessourcesChargement } from "@/components/ressources/liste-ressources";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Ressources" sousTitre="Documents et liens pour aller plus loin" />
      <ListeRessourcesChargement />
    </div>
  );
}
