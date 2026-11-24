import Link from "next/link";
import { CalendarDays, MessageCircle, UserPlus, Users, type LucideIcon } from "lucide-react";
import { lireTableauDeBord } from "@/lib/donnees/admin";
import { formaterJourComplet } from "@/lib/format";

function Chiffre({ icone: Icone, valeur, libelle, href, alerte = false }: { icone: LucideIcon; valeur: number; libelle: string; href: string; alerte?: boolean }) {
  return (
    <Link href={href} className="accueil-carte flex items-center gap-4 p-4 hover:brightness-95 sm:p-5">
      <span
        aria-hidden
        className={`flex size-11 shrink-0 items-center justify-center rounded-[0.6rem] ${alerte ? "bg-orange text-noir" : "bg-accent-clair text-noir"}`}
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
      <div className="grid gap-4 sm:grid-cols-3">
        <Chiffre icone={Users} valeur={t.participants} libelle={t.participants > 1 ? "Participants" : "Participant"} href="/admin/participants" />
        <Chiffre icone={CalendarDays} valeur={t.seancesAVenir} libelle="Sessions à venir" href="/admin/seances" />
        <Chiffre icone={MessageCircle} valeur={t.temoignagesAValider} libelle="Témoignages à valider" href="/admin/temoignages" alerte={t.temoignagesAValider > 0} />
      </div>

      <div className="grid items-start gap-4">
        <Panneau id="titre-inscrits" titre="Derniers inscrits">
          {t.derniersInscrits.length > 0 ? (
            <ul className="mt-3 divide-y divide-black/10">
              {t.derniersInscrits.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5">
                  <UserPlus aria-hidden className="size-4 shrink-0 text-accent" />
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
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-[5.5rem] rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
