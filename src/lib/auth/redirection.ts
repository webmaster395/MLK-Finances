/**
 * Redirection sûre après connexion ou après un lien reçu par e-mail.
 * On n'accepte qu'un chemin INTERNE du site (ex. « /cours »). Tout le reste
 * (adresse complète, « //site.com », « /\site.com », caractères inattendus) est refusé
 * et remplacé par la valeur par défaut : cela empêche d'envoyer une personne vers un faux site.
 */
export function cheminSur(valeur: unknown, parDefaut = "/accueil"): string {
  if (typeof valeur !== "string") return parDefaut;
  if (valeur.length === 0 || valeur.length > 200) return parDefaut;
  if (!valeur.startsWith("/")) return parDefaut;
  if (valeur.startsWith("//") || valeur.includes("\\")) return parDefaut;
  if (!/^\/[A-Za-z0-9\-._~/?=&%]*$/.test(valeur)) return parDefaut;
  return valeur;
}
