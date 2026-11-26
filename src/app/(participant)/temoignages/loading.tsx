import { TitrePage } from "@/components/coquille/titre-page";
import { ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      <TitrePage titre="Témoignages" sousTitre="Votre journal et les paroles partagées" />
      <ListeTemoignagesChargement />
    </div>
  );
}
