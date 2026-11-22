import { ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";
import { MonTemoignageChargement } from "@/components/temoignages/mon-temoignage";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <ListeTemoignagesChargement />
      <MonTemoignageChargement />
    </div>
  );
}
