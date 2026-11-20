import { redirect } from "next/navigation";

// Provisoire : au lot 3, redirige vers /connexion si personne n'est connecté.
export default function Page() {
  redirect("/accueil");
}
