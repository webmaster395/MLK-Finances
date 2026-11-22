import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, ShieldCheck, UserRound } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { changerRole, detacher, modifierParticipant, rattacher } from "@/lib/admin/actions";
import { CIVILITES, TRANCHES_AGE } from "@/lib/auth/profil";
import { lireParticipant, lireParticipants } from "@/lib/donnees/admin";
import { formaterJourComplet } from "@/lib/format";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_SELECT = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function PastilleAdmin() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-noir">
      <ShieldCheck aria-hidden className="size-3.5" />
      Admin
    </span>
  );
}

/** Liste de toutes les personnes inscrites. Sous <Suspense>. */
export async function ListeParticipants() {
  const personnes = await lireParticipants();
  if (personnes.length === 0) {
    return <EtatVide icone={UserRound} titre="Aucun inscrit" texte="Les personnes qui s'inscrivent sur le site apparaîtront ici." />;
  }
  const sansGroupe = personnes.filter((p) => p.role === "participant" && p.groupes.length === 0).length;

  return (
    <section className="accueil-carte p-5 sm:p-6" aria-label="Personnes inscrites">
      <p className="text-sm font-semibold">
        {personnes.length} personne{personnes.length > 1 ? "s" : ""} inscrite{personnes.length > 1 ? "s" : ""}
        {sansGroupe > 0 ? ` · ${sansGroupe} sans groupe` : ""}
      </p>
      <ul className="mt-2 divide-y divide-black/10">
        {personnes.map((p) => (
          <li key={p.id}>
            <Link href={`/admin/participants/${p.id}`} className="group flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{p.nom}</span>
                  {p.role === "admin" ? <PastilleAdmin /> : null}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {p.groupes.length > 0 ? (
                    p.groupes.map((g) => (
                      <span key={g.id} className="rounded-full border border-black/20 px-2 py-0.5 font-semibold text-noir">
                        {g.nom}
                      </span>
                    ))
                  ) : p.role === "participant" ? (
                    <span className="rounded-full bg-orange px-2 py-0.5 font-semibold text-noir">Sans groupe</span>
                  ) : null}
                  <span>inscrit le {formaterJourComplet(p.inscritLe)}</span>
                </span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Fiche d'une personne : informations, groupes, rôle. Sous <Suspense>. */
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
        <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">
          <span className="pinceau">{nomComplet}</span>
        </h1>
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
                    <input type="radio" name="civilite" value={code} defaultChecked={p.civilite === code} className="size-5 accent-rose" />
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
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-groupes">
            <h2 id="titre-groupes" className="titre-charte text-xl sm:text-2xl">
              Groupes
            </h2>
            {p.groupes.length > 0 ? (
              <ul className="mt-3 divide-y divide-black/10">
                {p.groupes.map((g) => (
                  <li key={g.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
                    <Link href={`/admin/groupes/${g.id}`} className="min-w-0 flex-1 text-sm font-semibold text-noir hover:underline [overflow-wrap:anywhere]">
                      {g.nom}
                    </Link>
                    {g.membre ? (
                      <FormulaireAction
                        key="retirer"
                        action={detacher}
                        bouton="Retirer"
                        enCoursTexte="Retrait…"
                        style="danger"
                        confirmation={`Retirer ${nomComplet} du groupe « ${g.nom} » ?`}
                        className="items-end"
                        afficherSucces={false}
                      >
                        <input type="hidden" name="participant_id" value={p.id} />
                        <input type="hidden" name="groupe_id" value={g.id} />
                      </FormulaireAction>
                    ) : (
                      <FormulaireAction key="rattacher" action={rattacher} bouton="Rattacher" enCoursTexte="Rattachement…" style="secondaire" className="items-end" afficherSucces={false}>
                        <input type="hidden" name="participant_id" value={p.id} />
                        <input type="hidden" name="groupe_id" value={g.id} />
                      </FormulaireAction>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm">
                Aucun groupe n&apos;existe encore. <Link href="/admin/groupes" className="font-semibold underline">Créer un groupe</Link>
              </p>
            )}
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
                confirmation={`Nommer ${nomComplet} administrateur ? Cette personne pourra tout gérer : groupes, contenus, participants.`}
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
