import "server-only";
import { connection } from "next/server";
import { creerClientServeur } from "@/lib/supabase/serveur";

/** La session concernée par un témoignage (null : « en général »). */
export type SessionLiee = {
  id: string;
  /** Titre complet, ex. « Session 2 — Construire et tenir mon budget » */
  titre: string;
  /** Version courte, ex. « Session 2 » */
  court: string;
  debut: string;
} | null;

function sessionLiee(s: { id: string; titre: string; debut: string } | null): SessionLiee {
  return s ? { id: s.id, titre: s.titre, court: s.titre.split(" — ")[0], debut: s.debut } : null;
}

/** Les sessions proposées dans le formulaire, et celle présélectionnée (la dernière déjà commencée). */
export async function lireChoixSessions(): Promise<{ sessions: { id: string; titre: string }[]; parDefaut: string }> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase.from("sessions").select("id, titre, debut").eq("publie", true).order("debut", { ascending: true });
  const liste = data ?? [];
  const maintenant = Date.now();
  const commencees = liste.filter((s) => new Date(s.debut).getTime() <= maintenant);
  return {
    sessions: liste.map((s) => ({ id: s.id, titre: s.titre })),
    parDefaut: commencees.at(-1)?.id ?? "",
  };
}

export type Temoignage = {
  session: SessionLiee;
  id: string;
  nom_affiche: string;
  texte: string;
  /** Date d'écriture (elle permet de retrouver la session). */
  creeLe: string;
  /** Lien temporaire (5 minutes) vers la photo ; null s'il n'y en a pas. */
  photoUrl: string | null;
};

/**
 * Les témoignages affichés aux participants (validés par l'équipe). Les règles de la base ne montrent aux autres que les validés ;
 * le filtre « valide » écarte aussi les témoignages en attente de la personne elle-même.
 */
export async function lireTemoignages(): Promise<Temoignage[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data } = await supabase
    .from("temoignages")
    .select("id, nom_affiche, texte, photo_path, cree_le, sessions(id, titre, debut)")
    .eq("valide", true)
    .order("cree_le", { ascending: false });
  const liste = data ?? [];

  const chemins = liste.flatMap((t) => (t.photo_path ? [t.photo_path] : []));
  const liens = chemins.length > 0 ? ((await supabase.storage.from("photos").createSignedUrls(chemins, 300)).data ?? []) : [];
  const parChemin = new Map(liens.map((l) => [l.path, l.signedUrl]));

  return liste.map((t) => ({
    id: t.id,
    nom_affiche: t.nom_affiche,
    texte: t.texte,
    creeLe: t.cree_le,
    session: sessionLiee(t.sessions),
    photoUrl: t.photo_path ? (parChemin.get(t.photo_path) ?? null) : null,
  }));
}

export type MonTemoignage = {
  id: string;
  session: SessionLiee;
  texte: string;
  /** Validé par l'équipe : visible par tous les participants. */
  valide: boolean;
  /** Faux : note privée (visible par l'auteur seul). Vrai : envoyé à l'équipe pour être partagé. */
  partage: boolean;
  creeLe: string;
};

/** L'historique des témoignages de la personne connectée, du plus récent au plus ancien. */
export async function lireMesTemoignages(): Promise<MonTemoignage[]> {
  await connection();
  const supabase = await creerClientServeur();
  const { data: utilisateur } = await supabase.auth.getUser();
  if (!utilisateur.user) return [];
  const { data } = await supabase
    .from("temoignages")
    .select("id, texte, valide, partage, cree_le, sessions(id, titre, debut)")
    .eq("auteur_id", utilisateur.user.id)
    .order("cree_le", { ascending: false });
  return (data ?? []).map((t) => ({
    id: t.id,
    texte: t.texte,
    valide: t.valide,
    partage: t.partage,
    creeLe: t.cree_le,
    session: sessionLiee(t.sessions),
  }));
}
