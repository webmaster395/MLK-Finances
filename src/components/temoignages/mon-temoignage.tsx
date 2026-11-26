import { CircleCheck, Clock, Lock, NotebookPen } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import type { MonTemoignage } from "@/lib/donnees/temoignages";
import { formaterJourComplet, partiesDate } from "@/lib/format";
import { ActionsTemoignage } from "./actions-temoignage";
import { AfficherPlus } from "./afficher-plus";
import { TexteRepliable } from "./texte-repliable";

const ETAT = "flex items-center gap-1.5 text-xs font-semibold";

/** Une entrée du journal : la date en grand à gauche (pour repérer la session), le témoignage à droite. */
function Entree({ t }: { t: MonTemoignage }) {
  const { jour, mois } = partiesDate(t.creeLe);

  return (
    <li className="flex gap-3 sm:gap-4">
      <p className="w-12 shrink-0 pt-3 text-center sm:w-16">
        <span aria-hidden className="titre-charte block text-3xl !leading-none sm:text-4xl">
          {jour}
        </span>
        <span aria-hidden className="mt-1 block text-xs font-semibold">
          {mois}
        </span>
        <span className="sr-only">Écrit le {formaterJourComplet(t.creeLe)}</span>
      </p>
      <article className="accueil-carte min-w-0 flex-1 p-4 sm:p-5">
        {t.valide ? (
          <p className={`${ETAT} text-accent`}>
            <CircleCheck aria-hidden className="size-4" />
            Visible par tous
          </p>
        ) : t.partage ? (
          <p className={`${ETAT} text-[#8f3306]`}>
            <Clock aria-hidden className="size-4" />
            En attente de validation
          </p>
        ) : (
          <p className={`${ETAT} text-doux`}>
            <Lock aria-hidden className="size-4" />
            Pour moi seulement
          </p>
        )}
        <div className="mt-2">
          <TexteRepliable texte={t.texte} />
        </div>
        {t.valide ? null : <ActionsTemoignage id={t.id} texte={t.texte} partage={t.partage} />}
      </article>
    </li>
  );
}

/** « Mon journal » : mes témoignages du plus récent au plus ancien. */
export function MonJournal({ temoignages }: { temoignages: MonTemoignage[] }) {
  return (
    <div className="flex flex-col gap-4">
      {temoignages.length > 0 ? (
        <AfficherPlus
          elements={temoignages.map((t) => (
            // La clé change quand le contenu change : le formulaire « Modifier » repart des valeurs enregistrées
            <Entree key={`${t.id}-${t.valide}-${t.partage}-${t.texte}`} t={t} />
          ))}
        />
      ) : (
        <EtatVide
          icone={NotebookPen}
          titre="Votre journal est vide"
          texte="Après une session, notez ce qui vous a parlé avec le bouton « Écrire un témoignage »."
        />
      )}
    </div>
  );
}
