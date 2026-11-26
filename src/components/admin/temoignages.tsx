import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { Avatar } from "@/components/profil/avatar";
import { EtatVide } from "@/components/coquille/etat-vide";
import { TexteRepliable } from "@/components/temoignages/texte-repliable";
import { changerValidation, creerTemoignage, modifierTemoignage, supprimerPhotoTemoignage, supprimerTemoignage } from "@/lib/admin/actions";
import { lireTemoignagesAdmin, type OngletTemoignages, type TemoignageAdmin } from "@/lib/donnees/admin";
import { formaterJourComplet, partiesDate } from "@/lib/format";
import { EnvoiPhotoTemoignage } from "./envoi-photo-temoignage";
import { FormulaireAction } from "./formulaire-action";

type Sessions = { id: string; titre: string }[];

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "").join("") || "?";
}

function ChampsTemoignage({ prefixe, sessions, t }: { prefixe: string; sessions: Sessions; t?: TemoignageAdmin }) {
  return (
    <>
      <Champ id={`${prefixe}-nom`} name="nom" libelle="Prénom affiché" required maxLength={100} defaultValue={t?.nom} placeholder="Ex. : Léa (le prénom seul)" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefixe}-session`} className="text-sm font-semibold text-noir">
          Session
        </label>
        <select id={`${prefixe}-session`} name="session_id" defaultValue={t?.sessionId ?? ""} className={CLASSE_CHAMP}>
          <option value="">En général (tout le parcours)</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.titre}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefixe}-texte`} className="text-sm font-semibold text-noir">
          Témoignage
        </label>
        <textarea id={`${prefixe}-texte`} name="texte" rows={5} required maxLength={1000} defaultValue={t?.texte} className={`${CLASSE_CHAMP} py-2`} />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="valide" defaultChecked={t?.valide ?? false} className="size-5 accent-accent" />
        Affiché aux participants
      </label>
    </>
  );
}

/** Un témoignage à relire : la date en grand à gauche (comme dans le journal des participants), les actions en bas. */
function CarteTemoignage({ t, sessions }: { t: TemoignageAdmin; sessions: Sessions }) {
  const { jour, mois } = partiesDate(t.creeLe);

  return (
    <li className="flex gap-3 sm:gap-4">
      <p className="w-12 shrink-0 pt-3 text-center sm:w-16">
        <span aria-hidden className="titre-charte block text-3xl !leading-none sm:text-4xl">
          {jour}
        </span>
        <span aria-hidden className="mt-1 block text-xs font-semibold">
          {mois}
        </span>
        <span className="sr-only">Écrit le {formaterJourComplet(t.creeLe)}</span>
      </p>
      <article className="accueil-carte min-w-0 flex-1 p-4 sm:p-5" aria-label={`Témoignage de ${t.nom}`}>
        <div className="flex items-center gap-3">
          <Avatar photoUrl={t.photoUrl} initiales={initiales(t.nom)} taille="size-10" texteTaille="text-sm" />
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-noir [overflow-wrap:anywhere]">{t.nom}</p>
            <p className="text-xs font-semibold [overflow-wrap:anywhere]">{t.session ?? "En général"}</p>
          </div>
        </div>
        <div className="mt-3">
          <TexteRepliable texte={t.texte} />
        </div>

        <div className="mt-3 flex flex-wrap items-start gap-2 border-t border-black/10 pt-3">
          {t.valide ? (
            <FormulaireAction key="retirer" action={changerValidation} bouton="Ne plus afficher" enCoursTexte="…" style="secondaire" afficherSucces={false} className="items-start">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="valide" value="non" />
            </FormulaireAction>
          ) : (
            <FormulaireAction key="valider" action={changerValidation} bouton="Valider" enCoursTexte="…" afficherSucces={false} className="items-start">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="valide" value="oui" />
            </FormulaireAction>
          )}
          <FormulaireAction
            action={supprimerTemoignage}
            bouton="Supprimer"
            enCoursTexte="…"
            style="danger"
            afficherSucces={false}
            confirmation="Supprimer définitivement ce témoignage (et sa photo) ?"
            className="ml-auto items-end"
          >
            <input type="hidden" name="id" value={t.id} />
          </FormulaireAction>
        </div>

        <details className="mt-3">
          <summary className="min-h-11 cursor-pointer content-center text-sm font-semibold text-noir underline">Modifier le texte ou la photo</summary>
          <div className="mt-3 flex flex-col gap-5">
            <FormulaireAction action={modifierTemoignage} bouton="Enregistrer">
              <input type="hidden" name="id" value={t.id} />
              <ChampsTemoignage prefixe={t.id} sessions={sessions} t={t} />
            </FormulaireAction>
            <div className="border-t border-black/10 pt-3">
              <EnvoiPhotoTemoignage temoignageId={t.id} remplacement={Boolean(t.photoPath)} />
              {t.photoPath ? (
                <div className="mt-2">
                  <FormulaireAction
                    action={supprimerPhotoTemoignage}
                    bouton="Retirer la photo"
                    enCoursTexte="…"
                    style="danger"
                    afficherSucces={false}
                    confirmation="Retirer la photo de ce témoignage ?"
                  >
                    <input type="hidden" name="id" value={t.id} />
                  </FormulaireAction>
                </div>
              ) : null}
            </div>
          </div>
        </details>
      </article>
    </li>
  );
}

function adresse(onglet: OngletTemoignages, filtre: string, page = 1) {
  const params = new URLSearchParams();
  if (onglet === "affiches") params.set("onglet", "affiches");
  if (filtre) params.set("session", filtre);
  if (page > 1) params.set("page", String(page));
  const texte = params.toString();
  return texte ? `/admin/temoignages?${texte}` : "/admin/temoignages";
}

const LIEN_PAGE =
  "inline-flex min-h-11 items-center gap-1.5 rounded-[0.9rem] border border-black/25 bg-white px-4 text-sm font-semibold text-noir hover:bg-black/5";
const PASTILLE = "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-xs font-semibold";

/**
 * Administration des témoignages partagés : en-tête avec les sous-onglets « À valider » et « Affichés »,
 * filtre par session, 20 par page. Lit l'adresse et la base : sous <Suspense>.
 */
export async function GestionTemoignages({ searchParams }: { searchParams: Promise<{ [cle: string]: string | string[] | undefined }> }) {
  const parametres = await searchParams;
  const onglet: OngletTemoignages = parametres.onglet === "affiches" ? "affiches" : "a-valider";
  const brutPage = typeof parametres.page === "string" ? Number(parametres.page) : 1;
  const demandee = Number.isInteger(brutPage) && brutPage > 0 ? brutPage : 1;
  const brutSession = typeof parametres.session === "string" ? parametres.session : "";
  const { temoignages, aValider, affiches, page, pages, filtre, sessions } = await lireTemoignagesAdmin(onglet, demandee, brutSession);

  const onglets = [
    { cle: "a-valider" as const, libelle: "À valider", nombre: aValider },
    { cle: "affiches" as const, libelle: "Affichés", nombre: affiches },
  ];
  const filtres = [
    { cle: "", libelle: "Toutes" },
    { cle: "general", libelle: "En général" },
    ...sessions.map((s) => ({ cle: s.id, libelle: s.titre.split(" — ")[0] })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[1.25rem] bg-[#0b0b10] text-white shadow-md" aria-labelledby="titre-temoignages">
        <div className="p-5 sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">ADMINISTRATION</p>
          <h1 id="titre-temoignages" className="titre-charte mt-2 text-3xl !leading-[1.05] !text-white sm:text-5xl">
            Les témoignages partagés
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
            Relisez, puis validez ce qui sera visible par tous les participants. Les notes privées ne vous sont pas montrées.
          </p>
        </div>
        <nav aria-label="Témoignages" className="flex border-t border-white/15 px-2 sm:px-6">
          {onglets.map((o) => (
            <Link
              key={o.cle}
              href={adresse(o.cle, filtre)}
              aria-current={onglet === o.cle ? "page" : undefined}
              className={`flex min-h-12 flex-1 items-center justify-center border-b-4 px-2 text-sm font-semibold sm:flex-none sm:px-5 ${
                onglet === o.cle ? "border-[#6b78f5] text-white" : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              {o.libelle} ({o.nombre})
            </Link>
          ))}
        </nav>
      </section>

      <nav aria-label="Filtrer par session" className="flex gap-2 overflow-x-auto pb-1">
        {filtres.map((f) => (
          <Link
            key={f.cle || "toutes"}
            href={adresse(onglet, f.cle)}
            aria-current={filtre === f.cle ? "true" : undefined}
            className={`${PASTILLE} ${filtre === f.cle ? "bg-accent text-white" : "border border-black/25 text-noir hover:bg-black/5"}`}
          >
            {f.libelle}
          </Link>
        ))}
      </nav>

      <details className="accueil-carte p-4 sm:p-5">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-noir">
          <Plus aria-hidden className="size-5 text-accent" />
          Ajouter un témoignage
        </summary>
        <div className="mt-3 max-w-2xl">
          <FormulaireAction action={creerTemoignage} bouton="Ajouter" enCoursTexte="Ajout…" viderApresSucces>
            <ChampsTemoignage prefixe="nouveau" sessions={sessions} />
          </FormulaireAction>
          <p className="mt-3 text-xs">La photo s&apos;ajoute une fois le témoignage enregistré (bouton « Modifier le texte ou la photo »).</p>
        </div>
      </details>

      {temoignages.length === 0 ? (
        <EtatVide
          icone={MessageCircle}
          titre={onglet === "affiches" ? "Aucun témoignage affiché" : "Rien à valider"}
          texte={onglet === "affiches" ? "Les témoignages validés apparaîtront ici." : "Les nouveaux témoignages partagés apparaîtront ici."}
        />
      ) : (
        <ul className="grid items-start gap-4 xl:grid-cols-2">
          {temoignages.map((t) => (
            <CarteTemoignage key={t.id} t={t} sessions={sessions} />
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label="Pages des témoignages" className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={adresse(onglet, filtre, page - 1)} className={LIEN_PAGE} rel="prev">
              Précédente
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-semibold text-noir">
            Page {page} sur {pages}
          </span>
          {page < pages ? (
            <Link href={adresse(onglet, filtre, page + 1)} className={LIEN_PAGE} rel="next">
              Suivante
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
