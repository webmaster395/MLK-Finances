/** Initiales affichées quand la personne n'a pas de photo (à défaut, la première lettre de l'e-mail). */
export function initiales(prenom: string, nom: string, email: string) {
  const i = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  return i || (email[0] ?? "?").toUpperCase();
}
