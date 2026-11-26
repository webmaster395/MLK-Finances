import { MessageCircle } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireChoixSessions, lireMesTemoignages, lireTemoignages } from "@/lib/donnees/temoignages";
import { formaterJourComplet } from "@/lib/format";
import { GalerieTemoignages } from "./galerie-temoignages";
import { MonJournal } from "./mon-temoignage";
import { OngletsTemoignages } from "./onglets-temoignages";

/** Initiales pour l'avatar (le nom affiché peut commencer par un marqueur comme « [test] »). */
function initiales(nom: string) {
  const mots = nom.replace(/\[[^\]]*\]/g, "").trim().split(/\s+/).filter(Boolean);
  const lettres = mots.slice(0, 2).map((m) => m[0]?.toUpperCase() ?? "");
  return lettres.join("") || "?";
}

/** Page Témoignages : en-tête, sous-onglets « Mon journal » et « Partagés par tous ». Lit la base : à placer sous <Suspense>. */
export async function ListeTemoignages() {
  const [personne, miens, partages, choixSessions] = await Promise.all([
    obtenirPersonne(),
    lireMesTemoignages(),
    lireTemoignages(),
    lireChoixSessions(),
  ]);
  // Groupes de la galerie : « En général » d'abord, puis les sessions de la 1 à la 6 (dates croissantes) ;
  // dans chaque groupe, les témoignages les plus récents restent en tête
  const classes = [...partages].sort((a, b) => (a.session?.debut ?? "").localeCompare(b.session?.debut ?? ""));

  const galerie =
    partages.length === 0 ? (
      <EtatVide icone={MessageCircle} titre="Aucun témoignage pour le moment" texte="Les témoignages partagés et validés par l'équipe apparaîtront ici." />
    ) : (
      <GalerieTemoignages
        temoignages={classes.map((t) => ({
          id: t.id,
          nom: t.nom_affiche,
          texte: t.texte,
          initiales: initiales(t.nom_affiche),
          photoUrl: t.photoUrl,
          date: formaterJourComplet(t.creeLe),
          groupeCle: t.session?.id ?? "general",
          groupeLibelle: t.session?.titre ?? "En général",
          groupeCourt: t.session?.court ?? "En général",
        }))}
      />
    );

  return (
    <OngletsTemoignages
      choixSessions={choixSessions}
      prenom={personne.prenom.trim() || "vous"}
      nombreJournal={miens.length}
      nombrePartages={partages.length}
      journal={<MonJournal temoignages={miens} />}
      partages={galerie}
    />
  );
}

/** Squelette pendant le chargement : l'en-tête et deux entrées en gris. */
export function ListeTemoignagesChargement() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Chargement des témoignages…</span>
      <div className="h-72 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      {[0, 1].map((i) => (
        <div key={i} className="h-36 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
