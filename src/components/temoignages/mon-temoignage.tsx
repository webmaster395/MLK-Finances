import { CircleCheck, Clock, Lock, NotebookPen, Quote } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import type { MonTemoignage } from "@/lib/donnees/temoignages";
import { formaterJourComplet, partiesDate } from "@/lib/format";
import { ActionsTemoignage } from "./actions-temoignage";
import { FiltresJournal, type EtatEntree } from "./filtres-journal";
import { TexteRepliable } from "./texte-repliable";

const ETATS = {
  prive: { libelle: "Pour moi seulement", icone: Lock, style: "bg-black/5 text-doux" },
  attente: { libelle: "En attente de validation", icone: Clock, style: "bg-[#e95609]/10 text-[#8f3306]" },
  visible: { libelle: "Visible par tous", icone: CircleCheck, style: "bg-accent-clair text-noir" },
} as const;

function etatDe(t: MonTemoignage): EtatEntree {
  return t.valide ? "visible" : t.partage ? "attente" : "prive";
}

/** Une entrée du journal : la date et la session en tête de carte, l'état à droite, puis le texte et les actions. */
function Entree({ t }: { t: MonTemoignage }) {
  const { jour, mois } = partiesDate(t.creeLe);
  const { libelle, icone: Icone, style } = ETATS[etatDe(t)];

  return (
    <li className="min-w-0">
      <article className="accueil-carte flex flex-col gap-3 p-4 sm:p-5">
        <span aria-hidden className="flex size-12 items-center justify-center rounded-[0.9rem] bg-accent-clair text-noir">
          <Quote className="size-6" strokeWidth={1.75} />
        </span>
        <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="shrink-0">
            <span aria-hidden className="titre-charte text-2xl !leading-none">
              {jour} {mois}
            </span>
            <span className="sr-only">Écrit le {formaterJourComplet(t.creeLe)}</span>
          </p>
          <p
            title={t.session?.titre}
            className="rounded-full border border-black/25 px-3 py-1 text-xs font-semibold text-noir first-letter:uppercase"
          >
            {t.session?.court ?? "En général"}
          </p>
          <p className={`flex items-center sm:ml-auto gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
            <Icone aria-hidden className="size-4 shrink-0" />
            {libelle}
          </p>
        </header>
        <TexteRepliable texte={t.texte} grand />
        {t.valide ? null : <ActionsTemoignage id={t.id} texte={t.texte} partage={t.partage} sessionId={t.session?.id ?? ""} />}
      </article>
    </li>
  );
}

/** « Mon journal » : mes témoignages du plus récent au plus ancien. */
export function MonJournal({ temoignages }: { temoignages: MonTemoignage[] }) {
  if (temoignages.length === 0) {
    return (
      <EtatVide
        icone={NotebookPen}
        titre="Votre journal est vide"
        texte="Après une session, notez ce qui vous a parlé avec le bouton « Écrire un témoignage »."
      />
    );
  }

  return (
    <FiltresJournal
      entrees={temoignages.map((t) => ({
        etat: etatDe(t),
        // La clé change quand le contenu change : le formulaire « Modifier » repart des valeurs enregistrées
        carte: <Entree key={`${t.id}-${t.valide}-${t.partage}-${t.session?.id}-${t.texte}`} t={t} />,
      }))}
    />
  );
}
