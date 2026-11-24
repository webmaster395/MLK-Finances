import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, Search, ShieldCheck, UserRound } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { changerRole, modifierParticipant } from "@/lib/admin/actions";
import { CIVILITES, TRANCHES_AGE } from "@/lib/auth/profil";
import { nettoyerRecherche } from "@/lib/admin/validation";
import { lireParticipant, lireParticipants, PARTICIPANTS_PAR_PAGE } from "@/lib/donnees/admin";
import { formaterJourComplet } from "@/lib/format";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_SELECT = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function PastilleAdmin() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
      <ShieldCheck aria-hidden className="size-3.5" />
      Admin
    </span>
  );
}

/** Repère « a écrit un témoignage » (publié, ou en attente de validation). */
function RepereTemoignage({ etat }: { etat: "valide" | "attente" }) {
  return etat === "attente" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange px-2.5 py-0.5 text-[11px] font-semibold text-noir">
      <MessageCircle aria-hidden className="size-3.5" />
      Témoignage à valider
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-clair px-2.5 py-0.5 text-[11px] font-semibold text-noir">
      <MessageCircle aria-hidden className="size-3.5" />
      A écrit un témoignage
    </span>
  );
}

function adresse(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const texte = params.toString();
  return texte ? `/admin/participants?${texte}` : "/admin/participants";
}

const LIEN_PAGE =
  "inline-flex min-h-11 items-center gap-1.5 rounded-[0.9rem] border border-black/25 bg-white px-4 text-sm font-semibold text-noir hover:bg-black/5";

/**
 * Liste des personnes inscrites : recherche par prénom ou nom, 25 par page (prévu pour plus de 300 personnes),
 * repère « a écrit un témoignage ». Lit l'adresse et la base : sous <Suspense>.
 */
export async function ListeParticipants({ searchParams }: { searchParams: Promise<{ [cle: string]: string | string[] | undefined }> }) {
  const parametres = await searchParams;
  const brutQ = typeof parametres.q === "string" ? parametres.q : "";
  const brutPage = typeof parametres.page === "string" ? Number(parametres.page) : 1;
  const q = nettoyerRecherche(brutQ);
  const demandee = Number.isInteger(brutPage) && brutPage > 0 ? brutPage : 1;

  let resultat = await lireParticipants(q, demandee);
  // Page trop lointaine (ex. adresse ancienne après une recherche plus étroite) : on affiche la dernière page existante
  if (resultat.personnes.length === 0 && demandee > 1) {
    const premiere = await lireParticipants(q, 1);
    resultat = premiere.pages > 1 ? await lireParticipants(q, premiere.pages) : premiere;
  }
  const { personnes, total, page, pages, ontTemoigne } = resultat;
  const debut = (page - 1) * PARTICIPANTS_PAR_PAGE + 1;

  return (
    <div className="flex flex-col gap-4">
      <form action="/admin/participants" method="get" role="search" className="accueil-carte flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:p-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="recherche-participant" className="text-sm font-semibold text-noir">
            Rechercher un participant
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-doux" />
            <input
              id="recherche-participant"
              type="search"
              name="q"
              defaultValue={q}
              maxLength={60}
              placeholder="Prénom ou nom"
              className="min-h-12 w-full rounded-md border border-black/25 bg-white pl-11 pr-4 text-base font-semibold text-noir placeholder:font-normal placeholder:text-black/60"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-principal">
          Rechercher
        </button>
        {q ? (
          <Link href="/admin/participants" className="inline-flex min-h-11 items-center justify-center text-sm font-semibold text-noir underline underline-offset-4">
            Effacer
          </Link>
        ) : null}
      </form>

      {total === 0 ? (
        <EtatVide
          icone={UserRound}
          titre={q ? "Aucun résultat" : "Aucun inscrit"}
          texte={q ? `Personne ne correspond à « ${q} ». Vérifiez l'orthographe ou cherchez un seul mot.` : "Les personnes qui s'inscrivent sur le site apparaîtront ici."}
        />
      ) : (
        <section className="accueil-carte p-5 sm:p-6" aria-label="Personnes inscrites">
          <p className="text-sm font-semibold text-noir" aria-live="polite">
            {q ? `${total} résultat${total > 1 ? "s" : ""} pour « ${q} »` : `${total} personne${total > 1 ? "s" : ""} inscrite${total > 1 ? "s" : ""}`}
            {" · "}
            {ontTemoigne === 0 ? "aucun témoignage écrit" : ontTemoigne === 1 ? "1 a écrit un témoignage" : `${ontTemoigne} ont écrit un témoignage`}
          </p>
          <p className="mt-0.5 text-xs">
            Affichage de {debut} à {debut + personnes.length - 1}, par ordre alphabétique.
          </p>
          <ul className="mt-2 divide-y divide-black/10">
            {personnes.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/participants/${p.id}`} className="group flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{p.nom}</span>
                      {p.role === "admin" ? <PastilleAdmin /> : null}
                      {p.temoignage ? <RepereTemoignage etat={p.temoignage} /> : null}
                    </span>
                    <span className="mt-1 block text-xs">
                      <span>inscrit le {formaterJourComplet(p.inscritLe)}</span>
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 ? (
            <nav aria-label="Pages de la liste" className="mt-4 flex items-center justify-between gap-3 border-t border-black/10 pt-4">
              {page > 1 ? (
                <Link href={adresse(q, page - 1)} className={LIEN_PAGE} rel="prev">
                  <ChevronLeft aria-hidden className="size-4" />
                  Précédente
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm font-semibold text-noir">
                Page {page} sur {pages}
              </span>
              {page < pages ? (
                <Link href={adresse(q, page + 1)} className={LIEN_PAGE} rel="next">
                  Suivante
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </section>
      )}
    </div>
  );
}

/** Fiche d'une personne : informations et rôle. Sous <Suspense>. */
export async function FicheParticipant({ id }: { id: string }) {
  const p = await lireParticipant(id);
  if (!p) notFound();
  const nomComplet = `${p.prenom} ${p.nom}`.trim() || "Sans nom";

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/participants" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        Tous les participants
      </Link>
      <div>
        <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">{nomComplet}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
          {p.role === "admin" ? <PastilleAdmin /> : null}
          Inscrit le {formaterJourComplet(p.inscritLe)}
        </p>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-infos">
          <h2 id="titre-infos" className="titre-charte mb-3 text-xl sm:text-2xl">
            Informations
          </h2>
          <FormulaireAction action={modifierParticipant} bouton="Enregistrer">
            <input type="hidden" name="id" value={p.id} />
            <fieldset className="flex flex-col gap-1.5">
              <legend className="mb-1.5 text-sm font-semibold text-noir">Civilité</legend>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {CIVILITES.map(({ code, libelle }) => (
                  <label key={code} className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
                    <input type="radio" name="civilite" value={code} defaultChecked={p.civilite === code} className="size-5 accent-accent" />
                    {libelle}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 sm:grid-cols-2">
              <Champ id="prenom" libelle="Prénom" required maxLength={100} defaultValue={p.prenom} />
              <Champ id="nom" libelle="Nom" required maxLength={100} defaultValue={p.nom} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="tranche_age" className="text-sm font-semibold text-noir">
                Tranche d&apos;âge
              </label>
              <select id="tranche_age" name="tranche_age" defaultValue={p.trancheAge ?? ""} className={CLASSE_SELECT}>
                <option value="">Non renseignée</option>
                {TRANCHES_AGE.map(({ code, libelle }) => (
                  <option key={code} value={code}>
                    {libelle}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs">L&apos;adresse e-mail sert à la connexion : elle ne se modifie pas ici.</p>
          </FormulaireAction>
        </section>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-role">
            <h2 id="titre-role" className="titre-charte mb-2 text-xl sm:text-2xl">
              Rôle
            </h2>
            {p.estMoi ? (
              <p className="text-sm">C&apos;est votre compte : vous ne pouvez pas changer votre propre rôle.</p>
            ) : p.role === "admin" ? (
              <FormulaireAction
                action={changerRole}
                bouton="Retirer le rôle d'administrateur"
                style="danger"
                confirmation={`Retirer le rôle d'administrateur à ${nomComplet} ?`}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="role" value="participant" />
                <p className="text-sm">Cette personne est administratrice : elle a accès à toute l&apos;administration.</p>
              </FormulaireAction>
            ) : (
              <FormulaireAction
                action={changerRole}
                bouton="Nommer administrateur"
                style="secondaire"
                confirmation={`Nommer ${nomComplet} administrateur ? Cette personne pourra tout gérer : contenus et participants.`}
              >
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="role" value="admin" />
                <p className="text-sm">Participant. Un administrateur peut tout gérer depuis l&apos;espace d&apos;administration.</p>
              </FormulaireAction>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
