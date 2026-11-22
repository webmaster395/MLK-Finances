import {
  BookOpen,
  CalendarDays,
  FilePen,
  FolderOpen,
  House,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  UsersRound,
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

/** Lien vers l'espace admin, ajouté au menu participant des administrateurs. */
export const PAGE_ADMINISTRATION: PageMenu = { href: "/admin", nom: "Administration", icone: ShieldCheck };

/**
 * Menu de l'espace administrateur. Les pages de gestion (groupes, séances, cours, devoirs,
 * messages, témoignages) s'ajouteront ici lot par lot.
 */
export const GROUPES_MENU_ADMIN: PageMenu[][] = [
  [{ href: "/admin", nom: "Tableau de bord", icone: LayoutDashboard }],
  [
    { href: "/admin/groupes", nom: "Groupes", icone: UsersRound },
    { href: "/admin/participants", nom: "Participants", icone: User },
  ],
  [
    { href: "/admin/seances", nom: "Séances", icone: CalendarDays },
    { href: "/admin/cours", nom: "Cours", icone: BookOpen },
    { href: "/admin/devoirs", nom: "Devoirs", icone: FilePen },
    { href: "/admin/messages", nom: "Messages", icone: Megaphone },
    { href: "/admin/temoignages", nom: "Témoignages", icone: MessageCircle },
  ],
  [{ href: "/accueil", nom: "Espace participant", icone: House }],
];
