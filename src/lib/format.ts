const FUSEAU = "Europe/Paris";

const jour = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: FUSEAU,
});
const heure = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: FUSEAU });

/** « mardi 24 novembre, 09:00 – 12:00 » (heure de Paris). Les dates sont stockées en timestamptz. */
export function formaterCreneau(debut: string, fin?: string | null): string {
  const d = new Date(debut);
  const texte = `${jour.format(d)}, ${heure.format(d)}`;
  return fin ? `${texte} – ${heure.format(new Date(fin))}` : texte;
}
