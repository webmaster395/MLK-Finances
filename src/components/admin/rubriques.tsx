import { Champ } from "@/components/auth/champ";
import { PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { creerRubrique, modifierRubrique, supprimerRubrique } from "@/lib/admin/actions";
import { lireRubriquesAdmin, type RubriqueAdmin } from "@/lib/donnees/admin";
import { FormulaireAction } from "./formulaire-action";

/** Champs d'une rubrique. Les identifiants sont préfixés pour rester uniques sur la page. */
function ChampsRubrique({ prefixe, rubrique }: { prefixe: string; rubrique?: RubriqueAdmin }) {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_6rem]">
      <Champ id={`${prefixe}-nom`} name="nom" libelle="Nom" required maxLength={60} defaultValue={rubrique?.nom} />
      <Champ id={`${prefixe}-couleur`} name="couleur" libelle="Couleur" type="color" required defaultValue={rubrique?.couleur ?? "#d634ba"} className="cursor-pointer px-1" />
      <Champ id={`${prefixe}-ordre`} name="ordre" libelle="Ordre" type="number" min={0} max={999} step={1} defaultValue={rubrique?.ordre ?? 0} />
    </div>
  );
}

/** Gestion des rubriques (types de séances en couleur). Sous <Suspense>. */
export async function GestionRubriques() {
  const rubriques = await lireRubriquesAdmin();

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
      <div className="flex flex-col gap-4">
        {rubriques.map((r) => (
          <section key={r.id} className="accueil-carte p-5 sm:p-6" aria-label={`Rubrique ${r.nom}`}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <PastilleRubrique rubrique={r} />
              <span className="text-xs font-semibold">
                {r.seances} séance{r.seances > 1 ? "s" : ""}
              </span>
            </div>
            <FormulaireAction action={modifierRubrique} bouton="Enregistrer">
              <input type="hidden" name="id" value={r.id} />
              <ChampsRubrique prefixe={r.id} rubrique={r} />
            </FormulaireAction>
            <div className="mt-3 border-t border-black/10 pt-3">
              <FormulaireAction
                action={supprimerRubrique}
                bouton="Supprimer la rubrique"
                enCoursTexte="Suppression…"
                style="danger"
                afficherSucces={false}
                confirmation={
                  r.seances > 0
                    ? `Supprimer « ${r.nom} » ? Ses ${r.seances} séance(s) resteront, mais sans rubrique (couleur grise).`
                    : `Supprimer la rubrique « ${r.nom} » ?`
                }
              >
                <input type="hidden" name="id" value={r.id} />
              </FormulaireAction>
            </div>
          </section>
        ))}
        {rubriques.length === 0 ? <p className="text-sm font-semibold">Aucune rubrique pour l&apos;instant.</p> : null}
      </div>

      <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-nouvelle-rubrique">
        <h2 id="titre-nouvelle-rubrique" className="titre-charte mb-3 text-xl sm:text-2xl">
          Nouvelle rubrique
        </h2>
        <FormulaireAction action={creerRubrique} bouton="Créer la rubrique" enCoursTexte="Création…" viderApresSucces>
          <ChampsRubrique prefixe="nouvelle" />
          <p className="text-xs">L&apos;ordre range les rubriques dans les listes (0 en premier).</p>
        </FormulaireAction>
      </section>
    </div>
  );
}
