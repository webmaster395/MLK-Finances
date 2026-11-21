import { CircleAlert, CircleCheck, Clock, FileCheck } from "lucide-react";
import type { StatutDevoir } from "@/lib/devoirs";

const STATUTS: Record<StatutDevoir, { libelle: string; classes: string; Icone: typeof Clock }> = {
  a_rendre: { libelle: "À rendre", classes: "bg-rose-clair text-noir", Icone: Clock },
  bientot: { libelle: "Bientôt dû", classes: "bg-orange text-white", Icone: Clock },
  en_retard: { libelle: "En retard", classes: "bg-[#c4262e] text-white", Icone: CircleAlert },
  rendu: { libelle: "Rendu", classes: "bg-[#1f7a3d] text-white", Icone: CircleCheck },
  corrige: { libelle: "Corrigé", classes: "bg-noir text-white", Icone: FileCheck },
};

/** Pastille de statut d'un devoir : le libellé est toujours écrit (la couleur ne suffit pas). */
export function BadgeStatut({ statut }: { statut: StatutDevoir }) {
  const { libelle, classes, Icone } = STATUTS[statut];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      <Icone aria-hidden className="size-3.5" />
      {libelle}
    </span>
  );
}
