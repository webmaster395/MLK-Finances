import { CalendarDays, FilePen, MessageCircle, UserPlus, Users, type LucideIcon } from "lucide-react";
import { lireTableauDeBord } from "@/lib/donnees/admin";
import { formaterCreneau, formaterJourComplet } from "@/lib/format";

function Chiffre({ icone: Icone, valeur, libelle, alerte = false }: { icone: LucideIcon; valeur: number; libelle: string; alerte?: boolean }) {
  return (
    <div className="accueil-carte flex items-center gap-4 p-4 sm:p-5">
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-[0.6rem] ${alerte ? "bg-orange text-white" : "bg-rose-clair text-noir"}`}
      >
        <Icone className="size-5" strokeWidth={1.85} />
      </span>
      <p className="min-w-0">
        <span className="block font-titre text-3xl font-semibold leading-none text-noir">{valeur}</span>
        <span className="mt-1 block text-sm font-semibold">{libelle}</span>
      </p>
    </div>
  );
}

function Panneau({ id, titre, compteur, children }: { id: string; titre: string; compteur?: number; children: React.ReactNode }) {
  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3">
        <h2 id={id} className="titre-charte text-xl sm:text-2xl">
          {titre}
        </h2>
        {compteur ? (
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange px-2 text-xs font-bold text-white">
            {compteur}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Tableau de bord de l'administrateur. Lit les données de tous les groupes : sous <Suspense>. */
export async function TableauDeBordAdmin() {
  const t = await lireTableauDeBord();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre icone={Users} valeur={t.participants} libelle={t.participants > 1 ? "Participants" : "Participant"} />
        <Chiffre icone={CalendarDays} valeur={t.seancesAVenir} libelle="Séances à venir" />
        <Chiffre icone={FilePen} valeur={t.aCorriger.length} libelle="Devoirs à corriger" alerte={t.aCorriger.length > 0} />
        <Chiffre icone={MessageCircle} valeur={t.temoignagesAValider} libelle="Témoignages à valider" alerte={t.temoignagesAValider > 0} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Panneau id="titre-corrections" titre="Devoirs à corriger" compteur={t.aCorriger.length}>
          {t.aCorriger.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10">
              {t.aCorriger.slice(0, 8).map((r) => (
                <li key={r.id} className="py-3">
                  <p className="text-sm font-semibold text-noir [overflow-wrap:anywhere]">{r.devoir}</p>
                  <p className="mt-0.5 text-xs">
                    {r.participant} · déposé le {formaterCreneau(r.deposeLe)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucun devoir en attente de correction.</p>
          )}
          {t.aCorriger.length > 8 ? <p className="mt-2 text-xs">… et {t.aCorriger.length - 8} autres.</p> : null}
        </Panneau>

        <div className="flex flex-col gap-4">
          <Panneau id="titre-sans-groupe" titre="Nouveaux inscrits sans groupe" compteur={t.sansGroupe.length}>
            <p className="mt-1 text-xs">Ils ne voient aucun contenu tant qu&apos;ils ne sont pas rattachés à une promotion.</p>
            {t.sansGroupe.length > 0 ? (
              <ul className="mt-2 divide-y divide-black/10">
                {t.sansGroupe.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <UserPlus aria-hidden className="size-4 shrink-0 text-rose" />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-noir">{p.nom}</span>
                    <span className="shrink-0 text-xs">inscrit le {formaterJourComplet(p.inscritLe)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-semibold">Tous les participants sont rattachés à un groupe.</p>
            )}
          </Panneau>

          <Panneau id="titre-groupes" titre="Groupes">
            {t.groupes.length > 0 ? (
              <ul className="mt-3 divide-y divide-black/10">
                {t.groupes.map((g) => (
                  <li key={g.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-noir">{g.nom}</span>
                      {g.promotion ? <span className="block text-xs">{g.promotion}</span> : null}
                    </span>
                    <span className="shrink-0 rounded-full border border-black/20 px-3 py-1 text-xs font-semibold text-noir">
                      {g.effectif} participant{g.effectif > 1 ? "s" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm font-semibold">Aucun groupe pour l&apos;instant.</p>
            )}
          </Panneau>
        </div>
      </div>
    </div>
  );
}

/** Squelette du tableau de bord (mêmes blocs, en gris). */
export function TableauDeBordChargement() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Chargement du tableau de bord…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[5.5rem] rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-64 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
        <div className="h-64 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      </div>
    </div>
  );
}
