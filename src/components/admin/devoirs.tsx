import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, ChevronRight, ClipboardList, Download, EyeOff, FilePlus } from "lucide-react";
import { Champ } from "@/components/auth/champ";
import { EtatVide } from "@/components/coquille/etat-vide";
import { changerStatutRendu, creerDevoir, modifierDevoir, supprimerDevoir } from "@/lib/admin/actions";
import { isoVersParis } from "@/lib/admin/validation";
import { lireDevoirAdmin, lireDevoirsAdmin, lireOptionsCours, type DevoirAdmin, type OptionsCours } from "@/lib/donnees/admin";
import { formaterCreneau } from "@/lib/format";
import { FormulaireAction } from "./formulaire-action";

const CLASSE_CHAMP = "min-h-11 w-full rounded-md border border-black/25 bg-white px-3 text-base font-semibold text-noir";

function Pastille({ children, couleur }: { children: React.ReactNode; couleur: "orange" | "neutre" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        couleur === "orange" ? "bg-orange text-noir" : "border border-black/25 text-noir"
      }`}
    >
      {children}
    </span>
  );
}

/** Champs d'un devoir (création et modification). L'échéance est en heure de Paris. */
function ChampsDevoir({ options, devoir, coursParDefaut }: { options: OptionsCours; devoir?: DevoirAdmin; coursParDefaut?: string }) {
  const echeance = devoir?.echeance ? isoVersParis(devoir.echeance) : null;
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cours_id" className="text-sm font-semibold text-noir">
          Cours
        </label>
        <select id="cours_id" name="cours_id" required defaultValue={devoir?.coursId ?? coursParDefaut ?? ""} className={CLASSE_CHAMP}>
          <option value="" disabled>
            Choisissez…
          </option>
          {options.cours.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titre}
            </option>
          ))}
        </select>
      </div>
      <Champ id="titre" libelle="Titre du devoir" required maxLength={200} defaultValue={devoir?.titre} placeholder="Ex. : Établir mon budget mensuel" />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="consigne" className="text-sm font-semibold text-noir">
          Consigne
        </label>
        <textarea id="consigne" name="consigne" rows={5} maxLength={5000} defaultValue={devoir?.consigne} className={`${CLASSE_CHAMP} py-2`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Champ id="date" libelle="Échéance (date)" type="date" defaultValue={echeance?.date} />
        <Champ id="heure" libelle="Heure (Paris)" type="time" defaultValue={echeance?.heure} aide="Vide : 23:59." />
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5 font-semibold text-noir">
        <input type="checkbox" name="publie" defaultChecked={devoir?.publie ?? true} className="size-5 accent-accent" />
        Publié (visible par les participants, si le cours est publié)
      </label>
    </>
  );
}

/** Liste des devoirs. Sous <Suspense>. */
export async function ListeDevoirs() {
  const devoirs = await lireDevoirsAdmin();
  return (
    <div className="flex flex-col gap-4">
      <Link href="/admin/devoirs/nouveau" className="btn btn-principal w-fit">
        <FilePlus aria-hidden className="size-5" />
        Nouveau devoir
      </Link>
      {devoirs.length === 0 ? (
        <EtatVide icone={ClipboardList} titre="Aucun devoir" texte="Créez un premier devoir avec le bouton « Nouveau devoir »." />
      ) : (
        <section className="accueil-carte p-5 sm:p-6" aria-label="Devoirs">
          <ul className="divide-y divide-black/10">
            {devoirs.map((d) => (
              <li key={d.id}>
                <Link href={`/admin/devoirs/${d.id}`} className="group flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{d.titre}</span>
                      {d.aCorriger > 0 ? <Pastille couleur="orange">{d.aCorriger} à corriger</Pastille> : null}
                      {d.publie ? null : (
                        <Pastille couleur="neutre">
                          <EyeOff aria-hidden className="size-3.5" />
                          Non publié
                        </Pastille>
                      )}
                    </span>
                    <span className="mt-1 block text-xs">
                      {d.echeance ? `Pour le ${formaterCreneau(d.echeance)}` : "Sans échéance"} · {d.cours} · {d.rendus} rendu
                      {d.rendus > 1 ? "s" : ""}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="size-4 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Retour() {
  return (
    <Link href="/admin/devoirs" className="flex w-fit items-center gap-2 text-sm font-semibold text-noir underline-offset-2 hover:underline">
      <ArrowLeft aria-hidden className="size-4" />
      Tous les devoirs
    </Link>
  );
}

/** Création d'un devoir. Sous <Suspense>. */
export async function NouveauDevoir({ coursId }: { coursId?: string }) {
  const options = await lireOptionsCours();
  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <h1 className="titre-charte text-3xl sm:text-5xl">
        <span className="pinceau">Nouveau devoir</span>
      </h1>
      {options.cours.length === 0 ? (
        <p className="text-sm font-semibold">
          Créez d&apos;abord un cours : chaque devoir appartient à un cours.{" "}
          <Link href="/admin/cours" className="underline">
            Créer un cours
          </Link>
        </p>
      ) : (
        <section className="accueil-carte max-w-3xl p-5 sm:p-6">
          <FormulaireAction action={creerDevoir} bouton="Créer le devoir" enCoursTexte="Création…">
            <ChampsDevoir options={options} coursParDefaut={coursId} />
          </FormulaireAction>
        </section>
      )}
    </div>
  );
}

/** Fiche d'un devoir : rendus à corriger, modification, suppression. Sous <Suspense>. */
export async function FicheDevoir({ id, cree, erreurFichier }: { id: string; cree: boolean; erreurFichier: boolean }) {
  const [devoir, options] = await Promise.all([lireDevoirAdmin(id), lireOptionsCours()]);
  if (!devoir) notFound();
  const aCorriger = devoir.rendus.filter((r) => r.statut === "depose").length;

  return (
    <div className="flex flex-col gap-5">
      <Retour />
      <div>
        <h1 className="titre-charte text-3xl sm:text-5xl [overflow-wrap:anywhere]">
          <span className="pinceau">{devoir.titre}</span>
        </h1>
        <p className="mt-2 text-sm font-semibold">
          {devoir.cours} · {devoir.echeance ? `pour le ${formaterCreneau(devoir.echeance)}` : "sans échéance"}
          {devoir.publie ? "" : " · non publié"}
        </p>
      </div>
      {cree ? (
        <p role="status" className="w-fit rounded-md bg-accent-clair px-3 py-2 text-sm font-semibold text-noir">
          Le devoir est créé.
        </p>
      ) : null}
      {erreurFichier ? (
        <p role="alert" className="w-fit rounded-md bg-orange/15 px-3 py-2 text-sm font-semibold text-[#8f3306]">
          Ce fichier est introuvable dans le stockage.
        </p>
      ) : null}

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-rendus">
            <div className="flex items-center justify-between gap-3">
              <h2 id="titre-rendus" className="titre-charte text-xl sm:text-2xl">
                Rendus ({devoir.rendus.length})
              </h2>
              {aCorriger > 0 ? <Pastille couleur="orange">{aCorriger} à corriger</Pastille> : null}
            </div>
            {devoir.rendus.length > 0 ? (
              <ul className="mt-3 divide-y divide-black/10">
                {devoir.rendus.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/participants/${r.participantId}`} className="text-sm font-semibold text-noir hover:underline">
                          {r.participant}
                        </Link>
                        {r.statut === "corrige" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-clair px-2 py-0.5 text-[11px] font-semibold text-noir">
                            <CircleCheck aria-hidden className="size-3.5" />
                            Corrigé
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-xs [overflow-wrap:anywhere]">
                        {r.nomFichier ?? "Fichier"} · déposé le {formaterCreneau(r.deposeLe)}
                      </span>
                    </span>
                    <a
                      href={`/admin/rendus/${r.id}/telecharger`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-[0.6rem] border border-black/25 px-3 text-sm font-semibold text-noir hover:bg-black/5"
                    >
                      <Download aria-hidden className="size-4" />
                      Télécharger
                    </a>
                    {r.statut === "depose" ? (
                      <FormulaireAction key="corriger" action={changerStatutRendu} bouton="Marquer corrigé" enCoursTexte="…" afficherSucces={false} className="items-end">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="statut" value="corrige" />
                      </FormulaireAction>
                    ) : (
                      <FormulaireAction
                        key="annuler"
                        action={changerStatutRendu}
                        bouton="Annuler la correction"
                        enCoursTexte="…"
                        style="secondaire"
                        afficherSucces={false}
                        confirmation={`Annuler la correction ? ${r.participant} pourra de nouveau remplacer son fichier.`}
                        className="items-end"
                      >
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="statut" value="depose" />
                      </FormulaireAction>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-semibold">Aucun participant n&apos;a encore rendu ce devoir.</p>
            )}
            <p className="mt-3 text-xs">Un devoir marqué « corrigé » ne peut plus être remplacé par le participant.</p>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-manquants">
            <h2 id="titre-manquants" className="titre-charte text-xl sm:text-2xl">
              Pas encore rendu ({devoir.manquants.length})
            </h2>
            {devoir.manquants.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {devoir.manquants.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/participants/${m.id}`} className="inline-block rounded-full border border-black/20 px-3 py-1 text-xs font-semibold text-noir hover:bg-black/5">
                      {m.nom}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm">Tous les participants ont rendu ce devoir.</p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-modifier">
            <h2 id="titre-modifier" className="titre-charte mb-3 text-xl sm:text-2xl">
              Modifier le devoir
            </h2>
            <FormulaireAction action={modifierDevoir} bouton="Enregistrer">
              <input type="hidden" name="id" value={devoir.id} />
              <ChampsDevoir options={options} devoir={devoir} />
            </FormulaireAction>
          </section>

          <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-supprimer">
            <h2 id="titre-supprimer" className="titre-charte mb-2 text-xl sm:text-2xl">
              Supprimer
            </h2>
            {devoir.rendus.length === 0 ? (
              <FormulaireAction
                action={supprimerDevoir}
                bouton="Supprimer ce devoir"
                enCoursTexte="Suppression…"
                style="danger"
                confirmation="Supprimer définitivement ce devoir ?"
              >
                <input type="hidden" name="id" value={devoir.id} />
              </FormulaireAction>
            ) : (
              <p className="text-sm">Des participants ont rendu ce devoir : il ne peut pas être supprimé. Dépubliez-le pour le masquer.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
