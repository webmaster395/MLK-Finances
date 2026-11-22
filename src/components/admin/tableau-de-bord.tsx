import Link from "next/link";
import { CalendarDays, FilePen, MessageCircle, UserPlus, Users, type LucideIcon } from "lucide-react";
import { lireTableauDeBord } from "@/lib/donnees/admin";
import { formaterCreneau, formaterJourComplet } from "@/lib/format";

function Chiffre({ icone: Icone, valeur, libelle, href, alerte = false }: { icone: LucideIcon; valeur: number; libelle: string; href: string; alerte?: boolean }) {
  return (
    <Link href={href} className="accueil-carte flex items-center gap-4 p-4 hover:brightness-95 sm:p-5">
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-[0.6rem] ${alerte ? "bg-orange text-noir" : "bg-rose-clair text-noir"}`}
      >
        <Icone className="size-5" strokeWidth={1.85} />
      </span>
      <p className="min-w-0">
        <span className="block font-titre text-3xl font-semibold leading-none text-noir">{valeur}</span>
        <span className="mt-1 block text-sm font-semibold">{libelle}</span>
      </p>
    </Link>
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
          <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-orange px-2 text-xs font-bold text-noir">
            {compteur}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** Tableau de bord de l'administrateur. Lit les données de tous les participants : sous <Suspense>. */
export async function TableauDeBordAdmin() {
  const t = await lireTableauDeBord();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre icone={Users} valeur={t.participants} libelle={t.participants > 1 ? "Participants" : "Participant"} href="/admin/participants" />
        <Chiffre icone={CalendarDays} valeur={t.seancesAVenir} libelle="Séances à venir" href="/admin/seances" />
        <Chiffre icone={FilePen} valeur={t.aCorriger.length} libelle="Devoirs à corriger" href="/admin/devoirs" alerte={t.aCorriger.length > 0} />
        <Chiffre icone={MessageCircle} valeur={t.temoignagesAValider} libelle="Témoignages à valider" href="/admin/temoignages" alerte={t.temoignagesAValider > 0} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Panneau id="titre-corrections" titre="Devoirs à corriger" compteur={t.aCorriger.length}>
          {t.aCorriger.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10">
              {t.aCorriger.slice(0, 8).map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/devoirs/${r.devoirId}`} className="group block py-3">
                    <span className="block text-sm font-semibold text-noir group-hover:underline [overflow-wrap:anywhere]">{r.devoir}</span>
                    <span className="mt-0.5 block text-xs">
                      {r.participant} · déposé le {formaterCreneau(r.deposeLe)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucun devoir en attente de correction.</p>
          )}
          {t.aCorriger.length > 8 ? <p className="mt-2 text-xs">… et {t.aCorriger.length - 8} autres.</p> : null}
        </Panneau>

        <Panneau id="titre-inscrits" titre="Derniers inscrits">
          {t.derniersInscrits.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10">
              {t.derniersInscrits.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <UserPlus aria-hidden className="size-4 shrink-0 text-rose" />
                  <Link href={`/admin/participants/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-semibold text-noir hover:underline">
                    {p.nom}
                  </Link>
                  <span className="shrink-0 text-xs">inscrit le {formaterJourComplet(p.inscritLe)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucun participant inscrit pour l&apos;instant.</p>
          )}
        </Panneau>
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
