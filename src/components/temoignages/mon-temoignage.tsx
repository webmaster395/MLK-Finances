import { CircleCheck, Clock, PenLine } from "lucide-react";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireMonTemoignage } from "@/lib/donnees/temoignages";
import { FormulaireTemoignage } from "./formulaire-temoignage";

/** « Prénom N. » : le nom sous lequel le témoignage sera publié (la base applique la même règle). */
function nomPublie(prenom: string, nom: string) {
  const initiale = nom.trim().charAt(0);
  return `${prenom.trim()}${initiale ? ` ${initiale}.` : ""}`.trim() || "Participant";
}

/** Bloc « Mon témoignage » de la page Témoignages. Lit les données de la personne : sous <Suspense>. */
export async function MonTemoignage() {
  const [personne, mien] = await Promise.all([obtenirPersonne(), lireMonTemoignage()]);

  return (
    <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-mon-temoignage">
      <h2 id="titre-mon-temoignage" className="titre-charte flex items-center gap-2.5 text-2xl sm:text-3xl">
        <PenLine aria-hidden className="size-6 text-rose" />
        {mien ? "Mon témoignage" : "Partager mon témoignage"}
      </h2>

      {mien?.valide ? (
        <div className="mt-3 flex flex-col gap-2">
          <p className="flex items-center gap-2 text-sm font-semibold text-noir">
            <CircleCheck aria-hidden className="size-4 text-rose" />
            Publié, sous le nom « {mien.nomAffiche} ». Merci !
          </p>
          <blockquote className="whitespace-pre-line text-sm font-semibold text-noir [overflow-wrap:anywhere]">« {mien.texte} »</blockquote>
          <p className="text-xs">Pour le modifier, contactez l&apos;équipe.</p>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {mien ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-noir">
              <Clock aria-hidden className="size-4 text-orange" />
              En attente de validation par l&apos;équipe. Vous pouvez encore le modifier ou le retirer.
            </p>
          ) : (
            <p className="text-sm">
              Racontez en quelques phrases ce que le parcours vous apporte. Il sera publié sous le nom «{" "}
              {nomPublie(personne.prenom, personne.nom)} », après validation par l&apos;équipe.
            </p>
          )}
          <FormulaireTemoignage texte={mien?.texte ?? ""} enAttente={Boolean(mien)} />
        </div>
      )}
    </section>
  );
}

export function MonTemoignageChargement() {
  return <div className="h-56 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" role="status" aria-label="Chargement…" />;
}
