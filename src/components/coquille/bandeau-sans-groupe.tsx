import { compterGroupes } from "@/lib/auth/personne";

/** Message affiché tant que la personne n'est rattachée à aucun groupe (rattachement manuel en phase 1). */
export async function BandeauSansGroupe() {
  const nombre = await compterGroupes();
  if (nombre > 0) return null;

  return (
    <section role="status" className="carte mb-6 flex flex-col gap-1 border-l-4 border-rose">
      <h2 className="titre-charte text-2xl">Inscription enregistrée</h2>
      <p className="font-semibold">
        Votre compte est bien créé. Vous serez rattaché(e) à votre groupe prochainement : vos sessions, cours et devoirs
        apparaîtront ici dès que ce sera fait.
      </p>
    </section>
  );
}
