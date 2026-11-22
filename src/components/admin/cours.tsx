import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, BookPlus, ChevronRight, Download, ExternalLink, EyeOff, FileText, Link2 } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { ajouterLien, creerCours, modifierCours, supprimerCours, supprimerSupport } from "@/lib/admin/actions";
import { lireCoursAdmin, lireCoursFiche, type CoursAdmin } from "@/lib/donnees/admin";
import { EnvoiSupport } from "./envoi-support";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

/** Champs d'un cours (création et modification). */
function ChampsCours({ cours }: { cours?: CoursAdmin }) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <Champ id="titre" libelle="Titre du cours" required maxLength={200} defaultValue={cours?.titre} placeholder="Ex. : Module 1 — Comprendre son budget" />
        <Champ id="ordre" libelle="Ordre" type="number" min={0} max={999} step={1} defaultValue={cours?.ordre ?? 0} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-semibold text-noir">
          Description
        </label>
        <textarea id="description" name="description" rows={4} maxLength={5000} defaultValue={cours?.description} className={`${CLASSE_CHAMP} py-2`} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="objectifs" className="text-sm font-semibold text-noir">
          Objectifs
        </label>
        <textarea
          id="objectifs"
          name="objectifs"
          rows={4}
          defaultValue={cours?.objectifs.join("\n")}
          aria-describedby="objectifs-aide"
          className={`${CLASSE_CHAMP} py-2`}
        />
        <p id="objectifs-aide" className="text-xs">
          Un objectif par ligne (20 au maximum).
        </p>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="publie" defaultChecked={cours?.publie ?? false} className="size-5 accent-rose" />
        Publié (contenu, supports et devoirs visibles par les participants)
      </label>
    </>
  );
}

/** Liste des cours. Sous <Suspense>. */
export async function ListeCours() {
  const cours = await lireCoursAdmin();

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/cours/nouveau" className="btn btn-orange w-fit">
        <BookPlus aria-hidden className="size-5" />
        Nouveau cours
      </Link>
      {cours.length === 0 ? (
        <EtatVide icone={BookOpen} titre="Aucun cours" texte="Créez un premier cours avec le bouton « Nouveau cours »." />
      ) : (
        <section className="accueil-carte p-5 sm:p-6" aria-label="Cours">
          <ul className="divide-y divide-black/10">
            {cours.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/cours/${c.id}`} className="group flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{c.titre}</span>
                      {c.publie ? null : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-black/25 px-2 py-0.5 text-[11px] font-semibold">
                          <EyeOff aria-hidden className="size-3.5" />
                          Non publié
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-xs">
                      {c.seances} séance{c.seances > 1 ? "s" : ""} · {c.supports} support{c.supports > 1 ? "s" : ""} · {c.devoirs} devoir
                      {c.devoirs > 1 ? "s" : ""}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Retour() {
  return (
    <Link href="/admin/cours" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
      <ArrowLeft aria-hidden className="size-4" />
      Tous les cours
    </Link>
  );
}

/** Création d'un cours. Sous <Suspense>. */
export async function NouveauCours() {
  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <h1 className="titre-charte text-3xl sm:text-5xl">
        <span className="pinceau">Nouveau cours</span>
      </h1>
        <section className="accueil-carte max-w-3xl p-5 sm:p-6">
          <FormulaireAction action={creerCours} bouton="Créer le cours" enCoursTexte="Création…">
            <ChampsCours />
          </FormulaireAction>
          <p className="mt-3 text-xs">Les supports (liens et fichiers) s&apos;ajoutent une fois le cours créé.</p>
        </section>
    </div>
  );
}

/** Fiche d'un cours : modification, supports, suppression. Sous <Suspense>. */
export async function FicheCours({ id, cree }: { id: string; cree: boolean }) {
  const cours = await lireCoursFiche(id);
  if (!cours) notFound();
  const supprimable = cours.seances === 0 && cours.devoirs === 0;

  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <div>
        <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">
          <span className="pinceau">{cours.titre}</span>
        </h1>
        <p className="mt-2 text-sm font-semibold">
          {cours.seances} séance{cours.seances > 1 ? "s" : ""} · {cours.devoirs} devoir{cours.devoirs > 1 ? "s" : ""}
          {cours.publie ? "" : " · non publié"}
        </p>
      </div>
      {cree ? (
        <p role="status" className="w-fit rounded-md bg-rose-clair px-3 py-2 text-sm font-semibold text-noir">
          Le cours est créé. Ajoutez-lui des supports ci-dessous.
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-modifier">
            <h2 id="titre-modifier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Modifier le cours
            </h2>
            <FormulaireAction action={modifierCours} bouton="Enregistrer">
              <input type="hidden" name="id" value={cours.id} />
              <ChampsCours cours={cours} />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-supports">
            <h2 id="titre-supports" className="titre-charte text-xl sm:text-2xl">
              Supports ({cours.supports.length})
            </h2>
            {cours.supports.length > 0 ? (
              <ul className="mt-3 divide-y divide-black/10">
                {cours.supports.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                    {s.type === "lien" ? (
                      <Link2 aria-hidden className="size-4 shrink-0 text-rose" />
                    ) : (
                      <FileText aria-hidden className="size-4 shrink-0 text-rose" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-noir [overflow-wrap:anywhere]">{s.titre}</span>
                      <span className="block truncate text-xs">{s.type === "lien" ? s.url : s.nomFichier}</span>
                    </span>
                    <a
                      href={`/ressources/${s.id}/telecharger`}
                      target={s.type === "lien" ? "_blank" : undefined}
                      rel={s.type === "lien" ? "noopener noreferrer" : undefined}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-[0.6rem] border border-black/25 px-3 text-sm font-semibold text-noir hover:bg-black/5"
                    >
                      {s.type === "lien" ? <ExternalLink aria-hidden className="size-4" /> : <Download aria-hidden className="size-4" />}
                      {s.type === "lien" ? "Ouvrir" : "Télécharger"}
                    </a>
                    <FormulaireAction
                      key={s.id}
                      action={supprimerSupport}
                      bouton="Supprimer"
                      enCoursTexte="Suppression…"
                      style="danger"
                      afficherSucces={false}
                      confirmation={`Supprimer le support « ${s.titre} » ?${s.type === "fichier" ? " Le fichier sera effacé." : ""}`}
                      className="items-end"
                    >
                      <input type="hidden" name="id" value={s.id} />
                    </FormulaireAction>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-semibold">Aucun support pour ce cours.</p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-fichier">
            <h2 id="titre-fichier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Ajouter un fichier
            </h2>
            <EnvoiSupport coursId={cours.id} />
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-lien">
            <h2 id="titre-lien" className="titre-charte mb-3 text-xl sm:text-2xl">
              Ajouter un lien
            </h2>
            <FormulaireAction action={ajouterLien} bouton="Ajouter le lien" enCoursTexte="Ajout…" viderApresSucces>
              <input type="hidden" name="cours_id" value={cours.id} />
              <Champ id="lien-titre" name="titre" libelle="Titre du support" required maxLength={200} />
              <Champ id="lien-url" name="url" libelle="Adresse web" type="url" required placeholder="https://…" />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-supprimer">
            <h2 id="titre-supprimer" className="titre-charte mb-2 text-xl sm:text-2xl">
              Supprimer le cours
            </h2>
            {supprimable ? (
              <FormulaireAction
                action={supprimerCours}
                bouton="Supprimer ce cours"
                enCoursTexte="Suppression…"
                style="danger"
                confirmation="Supprimer définitivement ce cours et tous ses supports (fichiers compris) ?"
              >
                <input type="hidden" name="id" value={cours.id} />
                <p className="text-xs">Ses supports seront supprimés avec lui, fichiers compris.</p>
              </FormulaireAction>
            ) : (
              <p className="text-sm">
                Ce cours a des séances ou des devoirs : il ne peut pas être supprimé, pour ne pas effacer les dépôts des participants.
                Dépubliez-le pour le masquer.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
