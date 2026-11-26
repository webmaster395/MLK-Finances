import Link from "next/link";
import { CalendarDays, ChevronRight, CircleCheck, MessageCircle, Users, Video, type LucideIcon } from "lucide-react";
import { lireTableauDeBord } from "@/lib/donnees/admin";
import { formaterCreneau, formaterJourComplet } from "@/lib/format";

function Chiffre({ icone: Icone, valeur, libelle, href, alerte = false }: { icone: LucideIcon; valeur: number; libelle: string; href: string; alerte?: boolean }) {
  return (
    <Link href={href} className="carte-survol accueil-carte flex h-full flex-col gap-3 p-4 sm:p-5">
      <span
        aria-hidden
        className={`flex size-11 items-center justify-center rounded-[0.9rem] text-noir ${alerte ? "bg-orange" : "bg-accent-clair"}`}
      >
        <Icone className="size-5" strokeWidth={1.85} />
      </span>
      <p>
        <span className="titre-charte block text-4xl !leading-none">{valeur}</span>
        <span className="mt-1 block text-sm font-semibold leading-snug">{libelle}</span>
      </p>
    </Link>
  );
}

function Panneau({ id, titre, lien, children }: { id: string; titre: string; lien?: { href: string; texte: string }; children: React.ReactNode }) {
  return (
    <section className="accueil-carte flex flex-col p-5 sm:p-6" aria-labelledby={id}>
      <h2 id={id} className="titre-charte text-xl sm:text-2xl">
        {titre}
      </h2>
      {children}
      {lien ? (
        <Link href={lien.href} className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-noir underline underline-offset-4">
          {lien.texte}
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ) : null}
    </section>
  );
}

/** Anneau « femmes / hommes » avec les nombres et pourcentages ; chaque ligne ouvre la liste filtrée. */
function Repartition({ femmes, hommes, nonRenseigne }: { femmes: number; hommes: number; nonRenseigne: number }) {
  const total = femmes + hommes + nonRenseigne;
  if (total === 0) return <p className="mt-3 text-sm font-semibold">Aucun participant inscrit pour l&apos;instant.</p>;

  const parts = [
    { libelle: "Femmes", nombre: femmes, trait: "stroke-accent", point: "bg-accent", href: "/admin/participants?civilite=madame&role=participant" },
    { libelle: "Hommes", nombre: hommes, trait: "stroke-[#a9b1f8]", point: "bg-[#a9b1f8]", href: "/admin/participants?civilite=monsieur&role=participant" },
    ...(nonRenseigne > 0 ? [{ libelle: "Non renseigné", nombre: nonRenseigne, trait: "stroke-black/15", point: "bg-black/15", href: "" }] : []),
  ];
  const pourcent = (n: number) => Math.round((n / total) * 100);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-6">
      <div className="relative size-40 shrink-0">
        {/* L'anneau est décoratif : les nombres sont écrits à côté */}
        <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden>
          {parts.map((part, i) => {
            const avant = parts.slice(0, i).reduce((somme, x) => somme + x.nombre, 0);
            return (
              <circle
                key={part.libelle}
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                strokeWidth="5"
                pathLength={total}
                strokeDasharray={`${part.nombre} ${total - part.nombre}`}
                strokeDashoffset={-avant}
                className={part.trait}
              />
            );
          })}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="titre-charte text-4xl !leading-none">{total}</span>
          <span className="text-xs font-semibold">participant{total > 1 ? "s" : ""}</span>
        </p>
      </div>
      <ul className="flex min-w-44 flex-1 flex-col gap-1">
        {parts.map((part) => {
          const contenu = (
            <>
              <span aria-hidden className={`size-3.5 shrink-0 rounded-full ${part.point}`} />
              <span className="flex-1 text-sm font-semibold text-noir">{part.libelle}</span>
              <span className="text-sm font-semibold text-noir">{part.nombre}</span>
              <span className="w-11 text-right text-xs">{pourcent(part.nombre)} %</span>
            </>
          );
          return (
            <li key={part.libelle}>
              {part.href ? (
                <Link href={part.href} className="flex min-h-11 items-center gap-3 rounded-[0.7rem] px-2 hover:bg-black/5">
                  {contenu}
                </Link>
              ) : (
                <p className="flex min-h-11 items-center gap-3 px-2">{contenu}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Tableau de bord de l'administrateur. Lit les données de tous les participants : sous <Suspense>. */
export async function TableauDeBordAdmin() {
  const t = await lireTableauDeBord();
  const p = t.prochaine;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-[1.25rem] bg-[#0b0b10] p-5 text-white shadow-md sm:p-8" aria-labelledby="titre-tableau">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">ADMINISTRATION</p>
        <h1 id="titre-tableau" className="titre-charte mt-2 text-3xl !leading-[1.05] !text-white sm:text-5xl">
          Tableau de bord
        </h1>
      </section>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <li>
          <Chiffre icone={Users} valeur={t.participants} libelle={t.participants > 1 ? "Participants" : "Participant"} href="/admin/participants" />
        </li>
        <li>
          <Chiffre icone={CalendarDays} valeur={t.seancesAVenir} libelle="Sessions à venir" href="/admin/seances" />
        </li>
        <li>
          <Chiffre
            icone={MessageCircle}
            valeur={t.temoignagesAValider}
            libelle="Témoignages à valider"
            href="/admin/temoignages"
            alerte={t.temoignagesAValider > 0}
          />
        </li>
        <li>
          <Chiffre icone={CircleCheck} valeur={t.temoignagesAffiches} libelle="Témoignages affichés" href="/admin/temoignages?onglet=affiches" />
        </li>
      </ul>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Panneau id="titre-prochaine" titre="Prochaine session" lien={p ? { href: `/admin/seances/${p.id}`, texte: "Préparer la session" } : undefined}>
          {p ? (
            <div className="mt-3 flex flex-col gap-1.5">
              <p className="text-base font-semibold text-noir [overflow-wrap:anywhere]">{p.titre}</p>
              <p className="text-sm font-semibold">{formaterCreneau(p.debut, p.fin)}</p>
              <p className="flex items-center gap-2 text-sm">
                <Video aria-hidden className="size-4 shrink-0 text-accent" />
                {p.avecLien ? "Lien de visioconférence renseigné" : "Lien de visioconférence à ajouter"}
              </p>
              <p className="text-sm">
                {p.documents} document{p.documents > 1 ? "s" : ""} · {p.publie ? "publiée" : "non publiée"}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucune session à venir.</p>
          )}
        </Panneau>

        <Panneau
          id="titre-relire"
          titre="À relire"
          lien={t.aRelire.length > 0 ? { href: "/admin/temoignages", texte: "Voir tout" } : undefined}
        >
          {t.aRelire.length > 0 ? (
            <ul className="mt-2 divide-y divide-black/10">
              {t.aRelire.map((x) => (
                <li key={x.id} className="py-3">
                  <p className="text-sm font-semibold text-noir">
                    {x.nom} <span className="font-normal">· {formaterJourComplet(x.creeLe)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm [overflow-wrap:anywhere]">« {x.texte} »</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm font-semibold">Aucun témoignage en attente.</p>
          )}
        </Panneau>

        <Panneau id="titre-repartition" titre="Femmes et hommes" lien={{ href: "/admin/participants", texte: "Tous les participants" }}>
          <Repartition {...t.repartition} />
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
      <div className="h-28 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
        ))}
      </div>
      <div className="h-64 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
    </div>
  );
}
