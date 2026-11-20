import {
  BookOpen,
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

/** Pages de l'espace participant, dans l'ordre du menu (comme la maquette Canva). */
export const PAGES_PARTICIPANT: PageMenu[] = [
  { href: "/accueil", nom: "Accueil", icone: House },
  { href: "/sessions", nom: "Sessions", icone: CalendarDays },
  { href: "/cours", nom: "Cours", icone: BookOpen },
  { href: "/devoirs", nom: "Devoirs", icone: FilePen },
  { href: "/ressources", nom: "Ressources", icone: FolderOpen },
  { href: "/temoignages", nom: "Témoignages", icone: MessageCircle },
  { href: "/profil", nom: "Profil", icone: User },
];
