import { TitrePage } from "@/components/coquille/titre-page";
import { CalendrierChargement } from "@/components/sessions/calendrier-chargement";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <TitrePage titre="Sessions" sousTitre="Les 6 sessions du parcours, en visioconférence" />
      <CalendrierChargement />
    </div>
  );
}
