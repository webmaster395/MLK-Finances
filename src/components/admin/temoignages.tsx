import { CircleCheck, MessageCircle } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { Avatar } from "@/components/profil/avatar";
import { EtatVide } from "@/components/coquille/etat-vide";
import { changerValidation, creerTemoignage, modifierTemoignage, supprimerPhotoTemoignage, supprimerTemoignage } from "@/lib/admin/actions";
import { lireTemoignagesAdmin, type TemoignageAdmin } from "@/lib/donnees/admin";
import { formaterJourComplet } from "@/lib/format";
import { EnvoiPhotoTemoignage } from "./envoi-photo-temoignage";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  return mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "").join("") || "?";
}

function ChampsTemoignage({ prefixe, t }: { prefixe: string; t?: TemoignageAdmin }) {
  return (
    <>
      <Champ id={`${prefixe}-nom`} name="nom" libelle="Prénom affiché" required maxLength={100} defaultValue={t?.nom} placeholder="Ex. : Léa (le prénom seul)" />
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

function CarteTemoignage({ t }: { t: TemoignageAdmin }) {
  return (
    <article className="accueil-carte p-5 sm:p-6" aria-label={`Témoignage de ${t.nom}`}>
      <div className="flex items-start gap-3">
        <Avatar photoUrl={t.photoUrl} initiales={initiales(t.nom)} taille="size-12" texteTaille="text-base" />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base font-semibold text-noir [overflow-wrap:anywhere]">{t.nom}</span>
            {t.valide ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-clair px-2 py-0.5 text-[11px] font-semibold text-noir">
                <CircleCheck aria-hidden className="size-3.5" />
                Affiché
              </span>
            ) : (
              <span className="rounded-full bg-orange px-2 py-0.5 text-[11px] font-semibold text-noir">À valider</span>
            )}
          </p>
          <p className="text-xs font-semibold">Écrit le {formaterJourComplet(t.creeLe)}</p>
        </div>
      </div>
      <blockquote className="mt-3 whitespace-pre-line text-sm font-semibold text-noir [overflow-wrap:anywhere]">« {t.texte} »</blockquote>

      <div className="mt-4 flex flex-wrap gap-2">
        {t.valide ? (
          <FormulaireAction key="retirer" action={changerValidation} bouton="Ne plus afficher" enCoursTexte="…" style="secondaire" afficherSucces={false} className="items-start">
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="valide" value="non" />
          </FormulaireAction>
        ) : (
          <FormulaireAction
            key="valider"
            action={changerValidation}
            bouton="Valider et afficher à tous"
            enCoursTexte="…"
            afficherSucces={false}
            className="items-start"
          >
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
          className="items-start"
        >
          <input type="hidden" name="id" value={t.id} />
        </FormulaireAction>
      </div>

      <details className="mt-4 border-t border-black/10 pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-noir underline">Modifier le texte ou la photo</summary>
        <div className="mt-3 flex flex-col gap-5">
          <FormulaireAction action={modifierTemoignage} bouton="Enregistrer">
            <input type="hidden" name="id" value={t.id} />
            <ChampsTemoignage prefixe={t.id} t={t} />
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
  );
}

/** Gestion des témoignages : afficher ou non, modifier, ajouter une photo. Sous <Suspense>. */
export async function GestionTemoignages() {
  const temoignages = await lireTemoignagesAdmin();
  const aValider = temoignages.filter((t) => !t.valide).length;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
      <div className="flex flex-col gap-4">
        {temoignages.length === 0 ? (
          <EtatVide icone={MessageCircle} titre="Aucun témoignage" texte="Ajoutez un premier témoignage avec le formulaire." />
        ) : (
          <>
            <p className="text-sm font-semibold">
              {temoignages.length} témoignage{temoignages.length > 1 ? "s" : ""} · {aValider} à valider
            </p>
            {temoignages.map((t) => (
              <CarteTemoignage key={t.id} t={t} />
            ))}
          </>
        )}
      </div>

      <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-nouveau-temoignage">
        <h2 id="titre-nouveau-temoignage" className="titre-charte mb-3 text-xl sm:text-2xl">
          Nouveau témoignage
        </h2>
        <FormulaireAction action={creerTemoignage} bouton="Ajouter" enCoursTexte="Ajout…" viderApresSucces>
          <ChampsTemoignage prefixe="nouveau" />
        </FormulaireAction>
        <p className="mt-3 text-xs">La photo s&apos;ajoute une fois le témoignage enregistré (bouton « Modifier le texte ou la photo »).</p>
      </section>
    </div>
  );
}
