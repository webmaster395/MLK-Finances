import Link from "next/link";
import { BookOpen, CalendarClock, ChevronRight, CircleCheck, ClipboardList, FileText } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { lireDevoirs, type DevoirListe } from "@/lib/donnees/devoirs";
import { estAFaire, grouperParJourEcheance } from "@/lib/devoirs";
import { formaterCreneau, formaterJourIso } from "@/lib/format";
import { BadgeStatut, couleurStatut } from "./badge-statut";

function CarteDevoir({ devoir }: { devoir: DevoirListe }) {
  const libelleCours = devoir.cours?.titre ?? devoir.seance?.titre ?? null;

  return (
    <li>
      <Link
        href={`/devoirs/${devoir.id}`}
        className="group flex items-center justify-between gap-3 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4 transition hover:shadow-md sm:gap-4"
        style={{ borderLeftColor: couleurStatut(devoir.statut) }}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex flex-wrap items-center gap-2">
              {devoir.seance?.rubrique ? <PastilleRubrique rubrique={devoir.seance.rubrique} /> : null}
              {libelleCours ? (
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <BookOpen aria-hidden className="size-3.5 shrink-0" />
                  <span className="[overflow-wrap:anywhere]">{libelleCours}</span>
                </span>
              ) : null}
            </span>
            <BadgeStatut statut={devoir.statut} />
          </span>

          <span className="text-sm font-semibold leading-snug text-noir group-hover:underline sm:text-base [overflow-wrap:anywhere]">
            {devoir.titre}
          </span>

          {devoir.rendu ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-noir">
                <FileText aria-hidden className="size-3.5 shrink-0" />
                <span className="[overflow-wrap:anywhere]">{devoir.rendu.nom_fichier ?? "Fichier déposé"}</span>
              </span>
              <span>
                · déposé le {formaterCreneau(devoir.rendu.depose_le).replace(/^./, (c) => c.toLowerCase())}
                {devoir.enRetard ? " — après la date limite" : ""}
              </span>
            </span>
          ) : devoir.echeance ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold">
              <CalendarClock aria-hidden className="size-3.5 shrink-0" />
              <span>À rendre pour le {formaterCreneau(devoir.echeance).replace(/^./, (c) => c.toLowerCase())}</span>
            </span>
          ) : null}

          {devoir.seance ? (
            <span className="text-xs">
              Séance du {formaterJourIso(devoir.seance.jour)}
              {devoir.cours && devoir.seance.titre !== devoir.cours.titre ? ` · ${devoir.seance.titre}` : ""}
            </span>
          ) : null}
        </span>

        <ChevronRight aria-hidden className="size-5 shrink-0 text-noir transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

/** Devoirs de la personne : à rendre (regroupés par jour d'échéance), puis rendus. Lit ses données : à placer sous <Suspense>. */
export async function ListeDevoirs() {
  const devoirs = await lireDevoirs();
  const aFaire = devoirs.filter((d) => estAFaire(d.statut));
  const rendus = devoirs
    .filter((d) => !estAFaire(d.statut))
    .sort((a, b) => new Date(b.rendu?.depose_le ?? 0).getTime() - new Date(a.rendu?.depose_le ?? 0).getTime());

  if (devoirs.length === 0) {
    return (
      <EtatVide
        icone={ClipboardList}
        titre="Aucun devoir pour le moment"
        texte="Vos devoirs, leur date limite et le dépôt de vos fichiers apparaîtront ici dès qu'ils seront publiés."
      />
    );
  }

  const groupesAFaire = grouperParJourEcheance(aFaire);
  const nbEnRetard = aFaire.filter((d) => d.statut === "en_retard").length;
  const nbBientot = aFaire.filter((d) => d.statut === "bientot").length;

  return (
    <div className="flex flex-col gap-6">
      <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-a-rendre">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs sm:text-sm">Travail à faire</p>
            <h2 id="titre-a-rendre" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">
              À rendre
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {nbEnRetard > 0 ? <BadgeStatut statut="en_retard" /> : null}
            {nbBientot > 0 ? <BadgeStatut statut="bientot" /> : null}
            <span
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] ${
                aFaire.length > 0 ? "bg-[#b42318] text-white" : "bg-black/5 text-noir"
              }`}
            >
              {aFaire.length > 0 ? `${aFaire.length} à rendre` : "À jour"}
            </span>
          </div>
        </div>

        <hr className="my-4 border-black/10" />

        {groupesAFaire.length > 0 ? (
          <div className="flex flex-col gap-6">
            {groupesAFaire.map(({ jour, devoirs: duJour }) => (
              <div key={jour ?? "sans-echeance"} className="flex flex-col gap-2.5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-noir">
                  <CalendarClock aria-hidden className="size-4 shrink-0 text-rose" />
                  <span className="first-letter:uppercase">
                    {jour ? `Échéance du ${formaterJourIso(jour, true)}` : "Sans date limite"}
                  </span>
                </h3>
                <ul className="flex flex-col gap-3">
                  {duJour.map((d) => (
                    <CarteDevoir key={d.id} devoir={d} />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="flex items-center gap-2.5 py-2 font-semibold text-noir">
            <CircleCheck aria-hidden className="size-5 shrink-0 text-[#1f7a3d]" />
            Aucun devoir en attente : tout est rendu.
          </p>
        )}
      </section>

      {rendus.length > 0 ? (
        <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-rendus">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm">Travaux déposés</p>
              <h2 id="titre-rendus" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">
                Rendus
              </h2>
            </div>
            <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
              {rendus.length} déposé{rendus.length > 1 ? "s" : ""}
            </span>
          </div>

          <hr className="my-4 border-black/10" />

          <ul className="flex flex-col gap-3">
            {rendus.map((d) => (
              <CarteDevoir key={d.id} devoir={d} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeDevoirsChargement() {
  return (
    <div className="flex flex-col gap-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement des devoirs…</span>
      <section className="accueil-carte p-5 sm:p-7">
        <p className="text-sm">Travail à faire</p>
        <h2 className="titre-charte mt-1 text-3xl !leading-tight sm:text-4xl">À rendre</h2>
        <hr className="my-4 border-black/10" />
        <div className="flex flex-col gap-3 motion-safe:animate-pulse">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-black/10" />
          ))}
        </div>
      </section>
    </div>
  );
}
