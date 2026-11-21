import { TitrePage } from "@/components/coquille/titre-page";
import { ListeDevoirsChargement } from "@/components/devoirs/liste-devoirs";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Devoirs" sousTitre="Votre travail à rendre" />
      <ListeDevoirsChargement />
    </div>
  );
}
