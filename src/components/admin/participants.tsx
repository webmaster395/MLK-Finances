import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { changerRole } from "@/lib/admin/actions";
import { nettoyerRecherche } from "@/lib/admin/validation";
import { CIVILITES, TRANCHES_AGE, civiliteValide, trancheAgeValide } from "@/lib/auth/profil";
import { initiales } from "@/lib/auth/initiales";
import { lireParticipant, lireParticipants, PARTICIPANTS_PAR_PAGE, type FiltresParticipants } from "@/lib/donnees/admin";
import { formaterJourComplet } from "@/lib/format";
import { FiltresParticipants as Filtres } from "./filtres-participants";
import { FormulaireAction } from "./formulaire-action";

const libelleCivilite = (code: string | null) => CIVILITES.find((c) => c.code === code)?.libelle ?? null;
const libelleAge = (code: string | null) => TRANCHES_AGE.find((x) => x.code === code)?.libelle ?? null;

function PastilleAdmin() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
      <ShieldCheck aria-hidden className="size-3.5" />
      Admin
    </span>
  );
}

/** Repère « a écrit un témoignage » (affiché, ou en attente de validation). */
function RepereTemoignage({ etat }: { etat: "valide" | "attente" }) {
  return etat === "attente" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange px-2.5 py-0.5 text-[11px] font-semibold text-noir">
      <MessageCircle aria-hidden className="size-3.5" />
      Témoignage à valider
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-clair px-2.5 py-0.5 text-[11px] font-semibold text-noir">
      <MessageCircle aria-hidden className="size-3.5" />
      A témoigné
    </span>
  );
}

function Pastille({ nom }: { nom: string }) {
  const [prenom, ...reste] = nom.split(" ");
  return (
    <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-clair text-sm font-semibold text-noir">
      {initiales(prenom, reste.join(" "), nom)}
    </span>
  );
}

function adresse(f: FiltresParticipants, page = 1) {
  const params = new URLSearchParams();
  if (f.recherche) params.set("q", f.recherche);
  if (f.civilite) params.set("civilite", f.civilite);
  if (f.trancheAge) params.set("age", f.trancheAge);
  if (f.role) params.set("role", f.role);
  if (f.temoignage) params.set("temoignage", f.temoignage);
  if (page > 1) params.set("page", String(page));
  const texte = params.toString();
  return texte ? `/admin/participants?${texte}` : "/admin/participants";
}

const LIEN_PAGE =
  "inline-flex min-h-11 items-center gap-1.5 rounded-[0.9rem] border border-black/25 bg-white px-4 text-sm font-semibold text-noir hover:bg-black/5";

/**
 * Les personnes inscrites : en-tête avec chiffres et sous-onglets, recherche et filtres, cartes (24 par page).
 * Lit l'adresse et la base : sous <Suspense>.
 */
export async function ListeParticipants({ searchParams }: { searchParams: Promise<{ [cle: string]: string | string[] | undefined }> }) {
  const parametres = await searchParams;
  const un = (cle: string) => (typeof parametres[cle] === "string" ? (parametres[cle] as string) : "");
  const role = un("role");
  const temoignage = un("temoignage");
  const filtres: FiltresParticipants = {
    recherche: nettoyerRecherche(un("q")),
    civilite: civiliteValide(un("civilite")) ? un("civilite") : "",
    trancheAge: trancheAgeValide(un("age")) ? un("age") : "",
    role: role === "admin" || role === "participant" ? role : "",
    temoignage: temoignage === "avec" || temoignage === "attente" ? temoignage : "",
  };
  const brutPage = Number(un("page"));
  const demandee = Number.isInteger(brutPage) && brutPage > 0 ? brutPage : 1;

  let resultat = await lireParticipants(filtres, demandee);
  // Page trop lointaine (ex. adresse ancienne après un filtre plus étroit) : on affiche la dernière page existante
  if (resultat.personnes.length === 0 && demandee > 1) {
    const premiere = await lireParticipants(filtres, 1);
    resultat = premiere.pages > 1 ? await lireParticipants(filtres, premiere.pages) : premiere;
  }
  const { personnes, total, page, pages, chiffres } = resultat;
  const debut = (page - 1) * PARTICIPANTS_PAR_PAGE + 1;

  const onglets = [
    { cle: "" as const, libelle: "Tous", nombre: chiffres.inscrits },
    { cle: "avec" as const, libelle: "Ont témoigné", nombre: chiffres.ontTemoigne },
    { cle: "attente" as const, libelle: "À valider", nombre: chiffres.aValider },
  ];

  return (
    <div className="flex flex-col gap-4">
      <section className="overflow-hidden rounded-[1.25rem] bg-[#0b0b10] text-white shadow-md" aria-labelledby="titre-participants">
        <div className="p-5 sm:p-8">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">ADMINISTRATION</p>
          <h1 id="titre-participants" className="titre-charte mt-2 text-3xl !leading-[1.05] !text-white sm:text-5xl">
            Les participants
          </h1>
          <p className="mt-3 text-sm leading-6 text-white/80 sm:text-base">
            {chiffres.inscrits} personne{chiffres.inscrits > 1 ? "s" : ""} inscrite{chiffres.inscrits > 1 ? "s" : ""}, dont{" "}
            {chiffres.admins} administrateur{chiffres.admins > 1 ? "s" : ""}.
          </p>
        </div>
        <nav aria-label="Participants" className="flex border-t border-white/15 px-2 sm:px-6">
          {onglets.map((o) => (
            <Link
              key={o.cle || "tous"}
              href={adresse({ ...filtres, temoignage: o.cle })}
              aria-current={filtres.temoignage === o.cle ? "page" : undefined}
              className={`flex min-h-12 flex-1 items-center justify-center border-b-4 px-1 text-center text-xs font-semibold sm:flex-none sm:px-5 sm:text-sm ${
                filtres.temoignage === o.cle ? "border-[#6b78f5] text-white" : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              {o.libelle} ({o.nombre})
            </Link>
          ))}
        </nav>
      </section>

      <Filtres
        temoignage={filtres.temoignage}
        initial={{ recherche: filtres.recherche, civilite: filtres.civilite, trancheAge: filtres.trancheAge, role: filtres.role }}
      />

      {total === 0 ? (
        <EtatVide icone={UserRound} titre="Aucun résultat" texte="Personne ne correspond à ces filtres. Modifiez la recherche ou effacez les filtres." />
      ) : (
        <>
          <p className="text-sm font-semibold text-noir" aria-live="polite">
            {total} personne{total > 1 ? "s" : ""} · affichage de {debut} à {debut + personnes.length - 1}, par ordre alphabétique
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {personnes.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/participants/${p.id}`} className="carte-survol accueil-carte group flex h-full items-start gap-3 p-4">
                  <Pastille nom={p.nom} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold text-noir [overflow-wrap:anywhere]">{p.nom}</span>
                    <span className="mt-0.5 block text-xs font-semibold">
                      {[libelleCivilite(p.civilite), libelleAge(p.trancheAge)].filter(Boolean).join(" · ") || "Profil incomplet"}
                    </span>
                    <span className="mt-0.5 block text-xs text-doux">Depuis le {formaterJourComplet(p.inscritLe)}</span>
                    {p.role === "admin" || p.temoignage ? (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {p.role === "admin" ? <PastilleAdmin /> : null}
                        {p.temoignage ? <RepereTemoignage etat={p.temoignage} /> : null}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight aria-hidden className="carte-fleche mt-1 size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>

          {pages > 1 ? (
            <nav aria-label="Pages de la liste" className="flex items-center justify-between gap-3">
              {page > 1 ? (
                <Link href={adresse(filtres, page - 1)} className={LIEN_PAGE} rel="prev">
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
                <Link href={adresse(filtres, page + 1)} className={LIEN_PAGE} rel="next">
                  Suivante
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}

/** Fiche d'une personne : informations en lecture seule et rôle. Sous <Suspense>. */
export async function FicheParticipant({ id }: { id: string }) {
  const p = await lireParticipant(id);
  if (!p) notFound();
  const nomComplet = `${p.prenom} ${p.nom}`.trim() || "Sans nom";
  const informations = [
    ["Civilité", libelleCivilite(p.civilite)],
    ["Prénom", p.prenom],
    ["Nom", p.nom],
    ["Tranche d'âge", libelleAge(p.trancheAge)],
    ["Inscription", formaterJourComplet(p.inscritLe)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/participants" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        Tous les participants
      </Link>

      <section className="rounded-[1.25rem] bg-[#0b0b10] p-5 text-white shadow-md sm:p-8">
        <div className="flex items-center gap-4">
          <Pastille nom={nomComplet} />
          <div className="min-w-0">
            <h1 className="titre-charte text-3xl !leading-[1.05] !text-white sm:text-5xl [overflow-wrap:anywhere]">{nomComplet}</h1>
            <p className="mt-2 text-sm text-white/80">{p.role === "admin" ? "Administrateur" : "Participant"}</p>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-infos">
          <h2 id="titre-infos" className="titre-charte mb-3 text-xl sm:text-2xl">
            Informations
          </h2>
          <dl className="divide-y divide-black/10">
            {informations.map(([libelle, valeur]) => (
              <div key={libelle} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                <dt className="text-sm">{libelle}</dt>
                <dd className="text-sm font-semibold text-noir [overflow-wrap:anywhere]">{valeur || "Non renseigné"}</dd>
              </div>
            ))}
          </dl>
        </section>

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
  );
}
