import { TitrePage } from "@/components/coquille/titre-page";
import { CalendrierChargement } from "@/components/sessions/calendrier-chargement";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <TitrePage titre="Sessions" sousTitre="Votre calendrier et vos cours" />
      <CalendrierChargement />
    </div>
  );
}
