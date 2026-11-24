/** Pages de l'espace connecté : il faut être connecté pour les ouvrir. */
export const PREFIXES_PROTEGES = [
  "/accueil",
  "/sessions",
  "/ressources",
  "/messages",
  "/temoignages",
  "/profil",
  "/admin",
];

/** Pages réservées aux visiteurs : une personne déjà connectée est renvoyée vers l'accueil. */
export const PAGES_VISITEUR = ["/connexion", "/inscription", "/mot-de-passe-oublie"];

function commencePar(chemin: string, prefixe: string) {
  return chemin === prefixe || chemin.startsWith(`${prefixe}/`);
}

export function estProtegee(chemin: string) {
  return PREFIXES_PROTEGES.some((p) => commencePar(chemin, p));
}

/** Pages de l'espace administrateur : réservées au rôle « admin ». */
export function estEspaceAdmin(chemin: string) {
  return commencePar(chemin, "/admin");
}
