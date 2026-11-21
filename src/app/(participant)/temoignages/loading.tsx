import { TitrePage } from "@/components/coquille/titre-page";
import { ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Témoignages" sousTitre="Les expériences des participants" />
      <ListeTemoignagesChargement />
    </div>
  );
}
