import Link from "next/link";
import { ArrowLeft, ChevronRight, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { creerGroupe, detacher, modifierGroupe, rattacher, supprimerGroupe } from "@/lib/admin/actions";
import { lireGroupe, lireGroupes, type GroupeDetail } from "@/lib/donnees/admin";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_SELECT = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

/** Champs nom + dates d'un groupe (création et modification). */
function ChampsGroupe({ groupe }: { groupe?: Pick<GroupeDetail, "nom" | "debut" | "fin"> }) {
  return (
    <>
      <Champ id="nom" libelle="Nom du groupe" required maxLength={150} defaultValue={groupe?.nom} placeholder="Ex. : Parcours Finances — Promotion 2027" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Champ id="debut" libelle="Début" type="date" defaultValue={groupe?.debut ?? undefined} />
        <Champ id="fin" libelle="Fin" type="date" defaultValue={groupe?.fin ?? undefined} />
      </div>
      <p className="text-xs">Les dates donnent le libellé « Promotion 2026–2027 » affiché aux participants.</p>
    </>
  );
}

/** Formulaire de création d'un groupe. */
export function NouveauGroupe() {
  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-nouveau-groupe">
      <h2 id="titre-nouveau-groupe" className="titre-charte mb-3 text-xl sm:text-2xl">
        Nouveau groupe
      </h2>
      <FormulaireAction action={creerGroupe} bouton="Créer le groupe" enCoursTexte="Création…">
        <ChampsGroupe />
      </FormulaireAction>
    </section>
  );
}

/** Liste des groupes. Sous <Suspense>. */
export async function ListeGroupes() {
  const groupes = await lireGroupes();
  if (groupes.length === 0) {
    return <EtatVide icone={Users} titre="Aucun groupe" texte="Créez un premier groupe avec le formulaire." />;
  }
  return (
    <section className="accueil-carte p-5 sm:p-6" aria-label="Groupes">
      <ul className="divide-y divide-black/10">
        {groupes.map((g) => (
          <li key={g.id}>
            <Link href={`/admin/groupes/${g.id}`} className="group flex items-center gap-3 py-3">
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{g.nom}</span>
                <span className="mt-0.5 block text-xs">
                  {[g.promotion, `${g.cours} cours`, `${g.seances} séance${g.seances > 1 ? "s" : ""}`].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-black/20 px-3 py-1 text-xs font-semibold text-noir">
                {g.effectif} participant{g.effectif > 1 ? "s" : ""}
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Fiche d'un groupe : modification, membres, rattachement, suppression. Sous <Suspense>. */
export async function FicheGroupe({ id }: { id: string }) {
  const g = await lireGroupe(id);
  if (!g) notFound();
  const supprimable = g.cours === 0 && g.seances === 0;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/groupes" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
        <ArrowLeft aria-hidden className="size-4" />
        Tous les groupes
      </Link>
      <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">
        <span className="pinceau">{g.nom}</span>
      </h1>
      <p className="-mt-2 text-sm font-semibold">
        {[g.promotion, `${g.effectif} participant${g.effectif > 1 ? "s" : ""}`, `${g.cours} cours`, `${g.seances} séance${g.seances > 1 ? "s" : ""}`]
          .filter(Boolean)
          .join(" · ")}
      </p>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-membres">
          <h2 id="titre-membres" className="titre-charte text-xl sm:text-2xl">
            Participants du groupe
          </h2>
          {g.membres.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10">
              {g.membres.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
                  <Link href={`/admin/participants/${m.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-noir hover:underline">
                    {m.nom}
                  </Link>
                  <FormulaireAction
                    action={detacher}
                    bouton="Retirer"
                    enCoursTexte="Retrait…"
                    style="danger"
                    confirmation={`Retirer ${m.nom} de ce groupe ? Il ne verra plus le contenu du groupe.`}
                    className="items-end"
                        afficherSucces={false}
                  >
                    <input type="hidden" name="participant_id" value={m.id} />
                    <input type="hidden" name="groupe_id" value={g.id} />
                  </FormulaireAction>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucun participant dans ce groupe.</p>
          )}

          <div className="mt-5 border-t border-black/10 pt-4">
            <h3 className="mb-2 text-sm font-semibold text-noir">Rattacher un participant</h3>
            {g.autres.length > 0 ? (
              <FormulaireAction action={rattacher} bouton="Rattacher" enCoursTexte="Rattachement…">
                <input type="hidden" name="groupe_id" value={g.id} />
                <label htmlFor="participant_id" className="sr-only">
                  Participant à rattacher
                </label>
                <select id="participant_id" name="participant_id" required defaultValue="" className={CLASSE_SELECT}>
                  <option value="" disabled>
                    Choisissez un participant…
                  </option>
                  {g.autres.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
                </select>
              </FormulaireAction>
            ) : (
              <p className="text-sm">Tous les participants sont déjà dans ce groupe.</p>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-modifier">
            <h2 id="titre-modifier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Modifier le groupe
            </h2>
            <FormulaireAction action={modifierGroupe} bouton="Enregistrer">
              <input type="hidden" name="id" value={g.id} />
              <ChampsGroupe groupe={g} />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-supprimer">
            <h2 id="titre-supprimer" className="titre-charte mb-2 text-xl sm:text-2xl">
              Supprimer le groupe
            </h2>
            {supprimable ? (
              <FormulaireAction
                action={supprimerGroupe}
                bouton="Supprimer ce groupe"
                enCoursTexte="Suppression…"
                style="danger"
                confirmation="Supprimer définitivement ce groupe ? Les participants seront détachés (leurs comptes sont conservés)."
              >
                <input type="hidden" name="id" value={g.id} />
                <p className="text-xs">Les participants sont détachés ; leurs comptes et leurs devoirs sont conservés.</p>
              </FormulaireAction>
            ) : (
              <p className="text-sm">
                Ce groupe a des cours ou des séances : il ne peut pas être supprimé, pour ne pas effacer son contenu.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
