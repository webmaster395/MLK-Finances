import { EyeOff, Megaphone } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { creerAnnonce, modifierAnnonce, supprimerAnnonce } from "@/lib/admin/actions";
import { lireAnnoncesAdmin, lireOptionsSeance, type AnnonceAdmin } from "@/lib/donnees/admin";
import { formaterCreneau } from "@/lib/format";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

/** Champs d'un message. Les identifiants sont préfixés pour rester uniques sur la page. */
function ChampsMessage({ prefixe, groupes, annonce }: { prefixe: string; groupes: { id: string; nom: string }[]; annonce?: AnnonceAdmin }) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefixe}-groupe`} className="text-sm font-semibold text-noir">
          Destinataires
        </label>
        <select id={`${prefixe}-groupe`} name="groupe_id" defaultValue={annonce?.groupeId ?? ""} className={CLASSE_CHAMP}>
          <option value="">Tous les groupes</option>
          {groupes.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nom}
            </option>
          ))}
        </select>
      </div>
      <Champ id={`${prefixe}-titre`} name="titre" libelle="Titre (facultatif)" maxLength={150} defaultValue={annonce?.titre} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${prefixe}-message`} className="text-sm font-semibold text-noir">
          Message
        </label>
        <textarea
          id={`${prefixe}-message`}
          name="message"
          rows={5}
          required
          maxLength={2000}
          defaultValue={annonce?.message}
          className={`${CLASSE_CHAMP} py-2`}
        />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="publie" defaultChecked={annonce?.publie ?? true} className="size-5 accent-rose" />
        Publié (visible tout de suite par les participants)
      </label>
    </>
  );
}

/** Messages de l'équipe : écrire, modifier, publier / dépublier, supprimer. Sous <Suspense>. */
export async function GestionMessages() {
  const [annonces, { groupes }] = await Promise.all([lireAnnoncesAdmin(), lireOptionsSeance()]);

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="flex flex-col gap-3">
        {annonces.length === 0 ? (
          <EtatVide icone={Megaphone} titre="Aucun message" texte="Écrivez un premier message avec le formulaire." />
        ) : (
          annonces.map((a) => (
            <details key={a.id} className="accueil-carte group p-5 sm:p-6">
              <summary className="cursor-pointer list-none">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-noir [overflow-wrap:anywhere]">{a.titre || "Sans titre"}</span>
                  <span className="rounded-full border border-black/20 px-2 py-0.5 text-[11px] font-semibold text-noir">
                    {a.groupe ?? "Tous les groupes"}
                  </span>
                  {a.publie ? null : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/25 px-2 py-0.5 text-[11px] font-semibold">
                      <EyeOff aria-hidden className="size-3.5" />
                      Non publié
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-xs">Écrit le {formaterCreneau(a.creeLe)}</span>
                <span className="mt-2 line-clamp-2 block whitespace-pre-line text-sm group-open:hidden">{a.message}</span>
                <span className="mt-2 inline-block text-xs font-semibold text-noir underline group-open:hidden">Modifier</span>
              </summary>
              <div className="mt-4 border-t border-black/10 pt-4">
                <FormulaireAction action={modifierAnnonce} bouton="Enregistrer">
                  <input type="hidden" name="id" value={a.id} />
                  <ChampsMessage prefixe={a.id} groupes={groupes} annonce={a} />
                </FormulaireAction>
                <div className="mt-3 border-t border-black/10 pt-3">
                  <FormulaireAction
                    action={supprimerAnnonce}
                    bouton="Supprimer le message"
                    enCoursTexte="Suppression…"
                    style="danger"
                    afficherSucces={false}
                    confirmation="Supprimer définitivement ce message ?"
                  >
                    <input type="hidden" name="id" value={a.id} />
                  </FormulaireAction>
                </div>
              </div>
            </details>
          ))
        )}
      </div>

      <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-nouveau-message">
        <h2 id="titre-nouveau-message" className="titre-charte mb-3 text-xl sm:text-2xl">
          Nouveau message
        </h2>
        <FormulaireAction action={creerAnnonce} bouton="Envoyer le message" enCoursTexte="Envoi…" viderApresSucces>
          <ChampsMessage prefixe="nouveau" groupes={groupes} />
        </FormulaireAction>
        <p className="mt-3 text-xs">Le message apparaît sur l&apos;accueil et dans le mégaphone des participants concernés.</p>
      </section>
    </div>
  );
}
