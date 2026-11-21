const FUSEAU = "Europe/Paris";

const jour = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: FUSEAU,
});
const jourComplet = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: FUSEAU,
});
const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: FUSEAU });
const numeroJour = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: FUSEAU });
const moisCourt = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: FUSEAU });

/** « mardi 24 novembre, 09:00 – 12:00 » (heure de Paris). Les dates sont stockées en timestamptz. */
export function formaterCreneau(debut: string, fin?: string | null): string {
  const d = new Date(debut);
  const texte = `${jour.format(d)}, ${heure.format(d)}`;
  return fin ? `${texte} – ${heure.format(new Date(fin))}` : texte;
}

/** « mardi 24 novembre 2026 » (heure de Paris). */
export function formaterJourComplet(debut: string): string {
  return jourComplet.format(new Date(debut));
}

/** « 09:00 – 12:00 » ou « 09:00 » (heure de Paris). */
export function formaterHoraires(debut: string, fin?: string | null): string {
  const h = heure.format(new Date(debut));
  return fin ? `${h} – ${heure.format(new Date(fin))}` : h;
}

/** Pour le petit calendrier d'une carte : { jour: "24", mois: "nov." } (heure de Paris). */
export function partiesDate(debut: string): { jour: string; mois: string } {
  const d = new Date(debut);
  return { jour: numeroJour.format(d), mois: moisCourt.format(d) };
}

const jourIso = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: FUSEAU });

/** Le jour calendaire à Paris, au format « 2026-12-05 » (sert à ranger les séances par jour). */
export function jourParis(instant: string | number | Date): string {
  return jourIso.format(new Date(instant));
}

/** Nombre de jours entre deux jours « AAAA-MM-JJ » (positif si `vers` est après `depuis`). */
export function joursEntre(depuis: string, vers: string): number {
  const ms = Date.UTC(+vers.slice(0, 4), +vers.slice(5, 7) - 1, +vers.slice(8, 10)) -
    Date.UTC(+depuis.slice(0, 4), +depuis.slice(5, 7) - 1, +depuis.slice(8, 10));
  return Math.round(ms / 86_400_000);
}

/** « samedi 5 décembre » à partir d'un jour « 2026-12-05 » (sans décalage horaire). */
export function formaterJourIso(jour: string, avecAnnee = false): string {
  const d = new Date(Date.UTC(+jour.slice(0, 4), +jour.slice(5, 7) - 1, +jour.slice(8, 10), 12));
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...(avecAnnee ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(d);
}

/** « Promotion 2026–2027 » à partir des dates du groupe (ou le nom du groupe à défaut). */
export function libellePromotion(groupe: { nom: string; debut: string | null; fin: string | null }): string {
  const an = (d: string | null) => (d ? d.slice(0, 4) : null);
  const debut = an(groupe.debut);
  const fin = an(groupe.fin);
  if (debut && fin && debut !== fin) return `Promotion ${debut}–${fin}`;
  if (debut ?? fin) return `Promotion ${debut ?? fin}`;
  return groupe.nom;
}
