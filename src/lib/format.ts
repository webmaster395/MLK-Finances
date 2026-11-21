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
