/** Pages de l'espace connecté : il faut être connecté pour les ouvrir. */
export const PREFIXES_PROTEGES = [
  "/accueil",
  "/sessions",
  "/cours",
  "/devoirs",
  "/ressources",
  "/temoignages",
  "/profil",
];

/** Pages réservées aux visiteurs : une personne déjà connectée est renvoyée vers l'accueil. */
export const PAGES_VISITEUR = ["/connexion", "/inscription", "/mot-de-passe-oublie"];

export function estProtegee(chemin: string) {
  return PREFIXES_PROTEGES.some((p) => chemin === p || chemin.startsWith(`${p}/`));
}
