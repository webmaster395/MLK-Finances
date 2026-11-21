import {
  CalendarDays,
  FilePen,
  FolderOpen,
  House,
  MessageCircle,
  User,
  type LucideIcon,
} from "lucide-react";

export type PageMenu = {
  href: string;
  nom: string;
  icone: LucideIcon;
};

/**
 * Pages du menu de l'espace participant, par groupes (un trait sépare les groupes).
 * Le profil n'est pas ici : on y accède par la pastille de la personne, en bas du menu.
 */
export const GROUPES_MENU: PageMenu[][] = [
  [{ href: "/accueil", nom: "Accueil", icone: House }],
  // « Sessions » = calendrier + cours (les cours sont fusionnés avec les séances)
  [{ href: "/sessions", nom: "Sessions", icone: CalendarDays }],
  [
    { href: "/devoirs", nom: "Devoirs", icone: FilePen },
    { href: "/ressources", nom: "Ressources", icone: FolderOpen },
    { href: "/temoignages", nom: "Témoignages", icone: MessageCircle },
  ],
];

export const PAGE_PROFIL: PageMenu = { href: "/profil", nom: "Mon profil", icone: User };
