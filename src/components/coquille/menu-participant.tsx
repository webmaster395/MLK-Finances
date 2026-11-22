import { initiales } from "@/lib/auth/initiales";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireMessages } from "@/lib/donnees/annonces";
import { compterDevoirsAFaire } from "@/lib/donnees/devoirs";
import { lirePromotion, lireUrlPhoto } from "@/lib/donnees/profil";
import { MenuLateral } from "./menu-lateral";

/** Menu de l'espace participant avec la vraie personne connectée. Lit la session : toujours sous <Suspense>. */
export async function MenuParticipant() {
  const [personne, devoirsAFaire, promotion, messages] = await Promise.all([
    obtenirPersonne(),
    compterDevoirsAFaire(),
    lirePromotion(),
    lireMessages(),
  ]);
  const photoUrl = await lireUrlPhoto(personne.photoPath);
  const nomComplet = `${personne.prenom} ${personne.nom}`.trim() || personne.email;

  return (
    <MenuLateral
      pastilles={{ "/devoirs": devoirsAFaire > 0 }}
      promotion={promotion}
      messages={messages}
      estAdmin={personne.role === "admin"}
      personne={{
        nomComplet,
        initiales: initiales(personne.prenom, personne.nom, personne.email),
        photoUrl,
      }}
    />
  );
}
