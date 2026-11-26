import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, CalendarX, ChevronRight, Download, ExternalLink, EyeOff, FileText, Link2, Video } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { TitrePage } from "@/components/coquille/titre-page";
import { COULEUR_SEANCE } from "@/components/seances/couleur-seance";
import { ajouterLien, creerSeance, modifierSeance, supprimerSeance, supprimerSupport } from "@/lib/admin/actions";
import { isoVersParis } from "@/lib/admin/validation";
import { lireSeanceAdmin, lireSeancesAdmin, type SeanceAdmin } from "@/lib/donnees/admin";
import { formaterCreneau } from "@/lib/format";
import { EnvoiSupport } from "./envoi-support";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

/** Zone de texte sur plusieurs lignes, avec un libellé et une aide facultative. */
function ZoneTexte({ id, libelle, aide, defaultValue, lignes = 4 }: {
  id: string;
  libelle: string;
  aide?: string;
  defaultValue?: string;
  lignes?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-noir">
        {libelle}
      </label>
      <textarea
        id={id}
        name={id}
        rows={lignes}
        maxLength={5000}
        defaultValue={defaultValue}
        aria-describedby={aide ? `${id}-aide` : undefined}
        className={`${CLASSE_CHAMP} py-2`}
      />
      {aide ? (
        <p id={`${id}-aide`} className="text-xs">
          {aide}
        </p>
      ) : null}
    </div>
  );
}

/** Champs d'une session (création et modification). Les heures sont celles de Paris. */
function ChampsSeance({ seance }: { seance?: SeanceAdmin }) {
  const debut = seance ? isoVersParis(seance.debut) : null;
  const fin = seance?.fin ? isoVersParis(seance.fin) : null;

  return (
    <>
      <Champ id="titre" libelle="Titre de la session" required maxLength={200} defaultValue={seance?.titre} placeholder="Ex. : Session 3 — Sortir des dettes" />

      <div className="grid gap-3 sm:grid-cols-3">
        <Champ id="date" libelle="Date" type="date" required defaultValue={debut?.date} />
        <Champ id="heure_debut" libelle="Début (heure de Paris)" type="time" required defaultValue={debut?.heure ?? "09:30"} />
        <Champ id="heure_fin" libelle="Fin" type="time" defaultValue={fin?.heure ?? (seance ? undefined : "12:00")} />
      </div>

      <Champ
        id="lien_visio"
        libelle="Lien de la visioconférence (Zoom…)"
        type="url"
        maxLength={2000}
        defaultValue={seance?.lienVisio ?? undefined}
        placeholder="https://zoom.us/j/…"
      />

      <ZoneTexte id="description" libelle="Description" defaultValue={seance?.description} />
      <ZoneTexte id="objectifs" libelle="Objectifs" aide="Un objectif par ligne (20 au maximum)." defaultValue={seance?.objectifs.join("\n")} />
      <ZoneTexte id="travaux_avant" libelle="Travaux à faire avant" aide="Ce que les participants préparent avant la session. Rien n'est à rendre." defaultValue={seance?.travauxAvant} />
      <ZoneTexte id="travaux_apres" libelle="Travaux à faire après" aide="Ce que les participants font après la session. Rien n'est à rendre." defaultValue={seance?.travauxApres} />
      <ZoneTexte id="materiel" libelle="Matériel à prévoir" lignes={3} defaultValue={seance?.materiel} />

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="publie" defaultChecked={seance?.publie ?? true} className="size-5 accent-accent" />
        Publiée (visible par les participants)
      </label>
    </>
  );
}

/** Liste des sessions. Sous <Suspense>. */
export async function ListeSeances() {
  const seances = await lireSeancesAdmin();
  const aVenir = seances.filter((s) => !s.passee);
  const passees = seances.filter((s) => s.passee).reverse();

  const bloc = (titre: string, liste: typeof seances) =>
    liste.length > 0 ? (
      <section className="accueil-carte p-5 sm:p-6" aria-label={titre}>
        <h2 className="titre-charte text-xl sm:text-2xl">
          {titre} <span className="text-base">({liste.length})</span>
        </h2>
        <ul className="mt-2 divide-y divide-black/10">
          {liste.map((s) => (
            <li key={s.id}>
              <Link href={`/admin/seances/${s.id}`} className="group flex items-center gap-3 py-3">
                <span aria-hidden className="w-1.5 self-stretch rounded-full" style={{ background: COULEUR_SEANCE }} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{s.titre}</span>
                    {s.publie ? null : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/25 px-2 py-0.5 text-[11px] font-semibold">
                        <EyeOff aria-hidden className="size-3.5" />
                        Non publiée
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs">
                    {formaterCreneau(s.debut, s.fin)} · {s.documents} document{s.documents > 1 ? "s" : ""}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs">
                    <Video aria-hidden className="size-3.5" />
                    {s.avecLien ? "Lien de visioconférence renseigné" : "Lien de visioconférence à ajouter"}
                  </span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/seances/nouvelle" className="btn btn-principal w-fit">
        <CalendarPlus aria-hidden className="size-5" />
        Nouvelle session
      </Link>
      {seances.length === 0 ? (
        <EtatVide icone={CalendarX} titre="Aucune session" texte="Créez une première session avec le bouton « Nouvelle session »." />
      ) : (
        <>
          {bloc("À venir", aVenir)}
          {bloc("Passées", passees)}
        </>
      )}
    </div>
  );
}

function Retour() {
  return (
    <Link href="/admin/seances" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
      <ArrowLeft aria-hidden className="size-4" />
      Toutes les sessions
    </Link>
  );
}

/** Création d'une session. */
export function NouvelleSeance() {
  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <TitrePage surtitre="ADMINISTRATION" titre="Nouvelle session" />
      <section className="accueil-carte max-w-3xl p-5 sm:p-6">
        <FormulaireAction action={creerSeance} bouton="Créer la session" enCoursTexte="Création…">
          <ChampsSeance />
        </FormulaireAction>
        <p className="mt-3 text-xs">Les documents (PDF ou liens Canva) s&apos;ajoutent une fois la session créée.</p>
      </section>
    </div>
  );
}

/** Fiche d'une session : modification, documents, suppression. Sous <Suspense>. */
export async function FicheSeance({ id, creee }: { id: string; creee: boolean }) {
  const seance = await lireSeanceAdmin(id);
  if (!seance) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <TitrePage
        surtitre="ADMINISTRATION"
        titre={seance.titre}
        sousTitre={`${formaterCreneau(seance.debut, seance.fin)}${seance.publie ? "" : " · non publiée"}`}
      />
      {creee ? (
        <p role="status" className="w-fit rounded-md bg-accent-clair px-3 py-2 text-sm font-semibold text-noir">
          La session est créée. Ajoutez-lui des documents ci-dessous.
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-modifier">
            <h2 id="titre-modifier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Modifier la session
            </h2>
            <FormulaireAction action={modifierSeance} bouton="Enregistrer">
              <input type="hidden" name="id" value={seance.id} />
              <ChampsSeance seance={seance} />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-documents">
            <h2 id="titre-documents" className="titre-charte text-xl sm:text-2xl">
              Documents ({seance.documents.length})
            </h2>
            {seance.documents.length > 0 ? (
              <ul className="mt-3 divide-y divide-black/10">
                {seance.documents.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                    {s.type === "lien" ? (
                      <Link2 aria-hidden className="size-4 shrink-0 text-accent" />
                    ) : (
                      <FileText aria-hidden className="size-4 shrink-0 text-accent" />
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
                      confirmation={`Supprimer le document « ${s.titre} » ?${s.type === "fichier" ? " Le fichier sera effacé." : ""}`}
                      className="items-end"
                    >
                      <input type="hidden" name="id" value={s.id} />
                    </FormulaireAction>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-semibold">Aucun document pour cette session.</p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-fichier">
            <h2 id="titre-fichier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Ajouter un PDF
            </h2>
            <EnvoiSupport sessionId={seance.id} />
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-lien">
            <h2 id="titre-lien" className="titre-charte mb-3 text-xl sm:text-2xl">
              Ajouter un lien (Canva…)
            </h2>
            <FormulaireAction action={ajouterLien} bouton="Ajouter le lien" enCoursTexte="Ajout…" viderApresSucces>
              <input type="hidden" name="session_id" value={seance.id} />
              <Champ id="lien-titre" name="titre" libelle="Titre du document" required maxLength={200} />
              <Champ id="lien-url" name="url" libelle="Adresse web" type="url" required placeholder="https://www.canva.com/…" />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-apercu">
            <h2 id="titre-apercu" className="titre-charte mb-2 text-xl sm:text-2xl">
              Côté participant
            </h2>
            {seance.publie ? (
              <p className="text-sm">Publiée : visible dans le calendrier des participants.</p>
            ) : (
              <p className="text-sm">Non publiée : les participants ne la voient pas encore.</p>
            )}
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-supprimer">
            <h2 id="titre-supprimer" className="titre-charte mb-2 text-xl sm:text-2xl">
              Supprimer
            </h2>
            <FormulaireAction
              action={supprimerSeance}
              bouton="Supprimer cette session"
              enCoursTexte="Suppression…"
              style="danger"
              confirmation="Supprimer définitivement cette session et tous ses documents (fichiers compris) ?"
            >
              <input type="hidden" name="id" value={seance.id} />
              <p className="text-xs">Ses documents seront supprimés avec elle, fichiers compris.</p>
            </FormulaireAction>
          </section>
        </div>
      </div>
    </div>
  );
}
