import { obtenirPersonne } from "@/lib/auth/personne";
import { compterDevoirsAFaire } from "@/lib/donnees/devoirs";
import { MenuLateral } from "./menu-lateral";

function initiales(prenom: string, nom: string, email: string) {
  const i = `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
  return i || (email[0] ?? "?").toUpperCase();
}

/** Menu de l'espace participant avec la vraie personne connectée. Lit la session : toujours sous <Suspense>. */
export async function MenuParticipant() {
  const [personne, devoirsAFaire] = await Promise.all([obtenirPersonne(), compterDevoirsAFaire()]);
  const nomComplet = `${personne.prenom} ${personne.nom}`.trim() || personne.email;

  return (
    <MenuLateral
      pastilles={{ "/devoirs": devoirsAFaire > 0 }}
      personne={{
        nomComplet,
        initiales: initiales(personne.prenom, personne.nom, personne.email),
      }}
    />
  );
}
