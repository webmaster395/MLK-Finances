import { CircleAlert, CircleCheck, Clock, FileCheck } from "lucide-react";
import type { StatutDevoir } from "@/lib/devoirs";

const STATUTS: Record<StatutDevoir, { libelle: string; classes: string; couleur: string; Icone: typeof Clock }> = {
  a_rendre: { libelle: "À rendre", classes: "bg-accent-clair text-noir", couleur: "#6b78f5", Icone: Clock },
  bientot: { libelle: "Bientôt dû", classes: "bg-orange text-white", couleur: "#e95609", Icone: Clock },
  en_retard: { libelle: "En retard", classes: "bg-[#c4262e] text-white", couleur: "#c4262e", Icone: CircleAlert },
  rendu: { libelle: "Rendu", classes: "bg-[#1f7a3d] text-white", couleur: "#1f7a3d", Icone: CircleCheck },
  corrige: { libelle: "Corrigé", classes: "bg-noir text-white", couleur: "#1f7a3d", Icone: FileCheck },
};

/** Couleur de repère associée au statut d'un devoir (bordure gauche des cartes). */
export function couleurStatut(statut: StatutDevoir): string {
  return STATUTS[statut].couleur;
}

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
