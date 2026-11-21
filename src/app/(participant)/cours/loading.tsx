import { TitrePage } from "@/components/coquille/titre-page";
import { ListeCoursChargement } from "@/components/cours/liste-cours";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Cours" sousTitre="Les modules de votre parcours" />
      <ListeCoursChargement />
    </div>
  );
}
