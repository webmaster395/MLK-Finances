import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, CalendarX, ChevronRight, EyeOff, MapPin } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { couleurSeance, PastilleRubrique } from "@/components/seances/pastille-rubrique";
import { creerSeance, modifierSeance, supprimerSeance } from "@/lib/admin/actions";
import { isoVersParis } from "@/lib/admin/validation";
import { lireOptionsSeance, lireSeanceAdmin, lireSeancesAdmin, type OptionsSeance, type SeanceAdmin } from "@/lib/donnees/admin";
import { formaterCreneau } from "@/lib/format";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function Libelle({ pour, children }: { pour: string; children: React.ReactNode }) {
  return (
    <label htmlFor={pour} className="text-sm font-semibold text-noir">
      {children}
    </label>
  );
}

/** Champs d'une séance (création et modification). Les heures sont celles de Paris. */
function ChampsSeance({ options, seance, groupeParDefaut }: { options: OptionsSeance; seance?: SeanceAdmin; groupeParDefaut?: string }) {
  const debut = seance ? isoVersParis(seance.debut) : null;
  const fin = seance?.fin ? isoVersParis(seance.fin) : null;
  const groupesDesCours = options.groupes.filter((g) => options.cours.some((c) => c.groupeId === g.id));

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Libelle pour="groupe_id">Groupe</Libelle>
          <select id="groupe_id" name="groupe_id" required defaultValue={seance?.groupeId ?? groupeParDefaut ?? ""} className={CLASSE_CHAMP}>
            <option value="" disabled>
              Choisissez…
            </option>
            {options.groupes.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Libelle pour="rubrique_id">Rubrique</Libelle>
          <select id="rubrique_id" name="rubrique_id" defaultValue={seance?.rubriqueId ?? ""} className={CLASSE_CHAMP}>
            <option value="">Sans rubrique</option>
            {options.rubriques.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Champ id="titre" libelle="Titre de la séance" required maxLength={200} defaultValue={seance?.titre} placeholder="Ex. : Session 3 — Atelier crédit" />

      <div className="grid gap-3 sm:grid-cols-3">
        <Champ id="date" libelle="Date" type="date" required defaultValue={debut?.date} />
        <Champ id="heure_debut" libelle="Début (heure de Paris)" type="time" required defaultValue={debut?.heure} />
        <Champ id="heure_fin" libelle="Fin" type="time" defaultValue={fin?.heure} />
      </div>

      <Champ id="lieu" libelle="Lieu" maxLength={200} defaultValue={seance?.lieu ?? undefined} placeholder="Ex. : Salle A, ou « En ligne »" />

      <div className="flex flex-col gap-1.5">
        <Libelle pour="cours_id">Cours lié</Libelle>
        <select id="cours_id" name="cours_id" defaultValue={seance?.coursId ?? ""} aria-describedby="cours-aide" className={CLASSE_CHAMP}>
          <option value="">Aucun cours</option>
          {groupesDesCours.map((g) => (
            <optgroup key={g.id} label={g.nom}>
              {options.cours
                .filter((c) => c.groupeId === g.id)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.titre}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <p id="cours-aide" className="text-xs">
          Le cours apporte le contenu, les supports et les devoirs de la séance. Il doit être du même groupe.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Libelle pour="intervenants">Intervenants</Libelle>
        <textarea
          id="intervenants"
          name="intervenants"
          rows={3}
          defaultValue={seance?.intervenants.join("\n")}
          aria-describedby="intervenants-aide"
          className={`${CLASSE_CHAMP} py-2`}
        />
        <p id="intervenants-aide" className="text-xs">
          Un nom par ligne (10 au maximum).
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Libelle pour="description">Description</Libelle>
        <textarea id="description" name="description" rows={4} maxLength={5000} defaultValue={seance?.description} className={`${CLASSE_CHAMP} py-2`} />
      </div>

      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="publie" defaultChecked={seance?.publie ?? true} className="size-5 accent-rose" />
        Publiée (visible par les participants du groupe)
      </label>
    </>
  );
}

/** Liste des séances, avec filtre par groupe. Sous <Suspense>. */
export async function ListeSeances({ groupeId }: { groupeId?: string }) {
  const [seances, options] = await Promise.all([lireSeancesAdmin(groupeId), lireOptionsSeance()]);
  const aVenir = seances.filter((s) => !s.passee);
  const passees = seances.filter((s) => s.passee).reverse();
  const filtre = (actif: boolean) =>
    `rounded-full border px-3 py-1.5 text-xs font-semibold ${actif ? "border-noir bg-noir text-white" : "border-black/25 text-noir hover:bg-black/5"}`;

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
                <span aria-hidden className="w-1.5 self-stretch rounded-full" style={{ background: couleurSeance(s.rubrique) }} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{s.titre}</span>
                    <PastilleRubrique rubrique={s.rubrique} />
                    {s.publie ? null : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/25 px-2 py-0.5 text-[11px] font-semibold">
                        <EyeOff aria-hidden className="size-3.5" />
                        Non publiée
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs">
                    {formaterCreneau(s.debut, s.fin)} · {s.groupe}
                    {s.cours ? ` · ${s.cours}` : ""}
                  </span>
                  {s.lieu ? (
                    <span className="mt-0.5 flex items-center gap-1 text-xs">
                      <MapPin aria-hidden className="size-3.5" />
                      {s.lieu}
                    </span>
                  ) : null}
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
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/admin/seances/nouvelle" className="btn btn-orange w-fit">
          <CalendarPlus aria-hidden className="size-5" />
          Nouvelle séance
        </Link>
        <nav aria-label="Filtrer par groupe" className="flex flex-wrap gap-1.5 sm:ml-auto">
          <Link href="/admin/seances" className={filtre(!groupeId)} aria-current={!groupeId ? "page" : undefined}>
            Tous les groupes
          </Link>
          {options.groupes.map((g) => (
            <Link key={g.id} href={`/admin/seances?groupe=${g.id}`} className={filtre(groupeId === g.id)} aria-current={groupeId === g.id ? "page" : undefined}>
              {g.nom}
            </Link>
          ))}
        </nav>
      </div>
      {seances.length === 0 ? (
        <EtatVide icone={CalendarX} titre="Aucune séance" texte="Créez une première séance avec le bouton « Nouvelle séance »." />
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
      Toutes les séances
    </Link>
  );
}

/** Création d'une séance. Sous <Suspense>. */
export async function NouvelleSeance({ groupeId }: { groupeId?: string }) {
  const options = await lireOptionsSeance();
  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <h1 className="titre-charte text-3xl sm:text-5xl">
        <span className="pinceau">Nouvelle séance</span>
      </h1>
      {options.groupes.length === 0 ? (
        <p className="text-sm font-semibold">
          Créez d&apos;abord un groupe : chaque séance appartient à un groupe.{" "}
          <Link href="/admin/groupes" className="underline">
            Créer un groupe
          </Link>
        </p>
      ) : (
        <section className="accueil-carte max-w-3xl p-5 sm:p-6">
          <FormulaireAction action={creerSeance} bouton="Créer la séance" enCoursTexte="Création…">
            <ChampsSeance options={options} groupeParDefaut={groupeId} />
          </FormulaireAction>
        </section>
      )}
    </div>
  );
}

/** Modification d'une séance. Sous <Suspense>. */
export async function FicheSeance({ id, creee }: { id: string; creee: boolean }) {
  const [seance, options] = await Promise.all([lireSeanceAdmin(id), lireOptionsSeance()]);
  if (!seance) notFound();

  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <div>
        <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">
          <span className="pinceau">{seance.titre}</span>
        </h1>
        <p className="mt-2 text-sm font-semibold">{formaterCreneau(seance.debut, seance.fin)}</p>
      </div>
      {creee ? (
        <p role="status" className="w-fit rounded-md bg-rose-clair px-3 py-2 text-sm font-semibold text-noir">
          La séance est créée.
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-modifier">
          <h2 id="titre-modifier" className="titre-charte mb-3 text-xl sm:text-2xl">
            Modifier la séance
          </h2>
          <FormulaireAction action={modifierSeance} bouton="Enregistrer">
            <input type="hidden" name="id" value={seance.id} />
            <ChampsSeance options={options} seance={seance} />
          </FormulaireAction>
        </section>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-apercu">
            <h2 id="titre-apercu" className="titre-charte mb-2 text-xl sm:text-2xl">
              Côté participant
            </h2>
            {seance.publie ? (
              <p className="text-sm">Publiée : visible dans le calendrier des participants du groupe.</p>
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
              bouton="Supprimer cette séance"
              enCoursTexte="Suppression…"
              style="danger"
              confirmation="Supprimer définitivement cette séance ? Le cours lié, ses supports et ses devoirs sont conservés."
            >
              <input type="hidden" name="id" value={seance.id} />
              <p className="text-xs">Le cours lié, ses supports et ses devoirs sont conservés.</p>
            </FormulaireAction>
          </section>
        </div>
      </div>
    </div>
  );
}
