import { CircleCheck, Clock, History, Lock, PenLine } from "lucide-react";
import { obtenirPersonne } from "@/lib/auth/personne";
import { lireMesTemoignages, type MonTemoignage } from "@/lib/donnees/temoignages";
import { formaterJourComplet } from "@/lib/format";
import { FormulaireTemoignage, RetirerTemoignage } from "./formulaire-temoignage";

function Ligne({ t }: { t: MonTemoignage }) {
  return (
    <li className="rounded-lg border border-black/15 bg-white/40 p-4">
      <p className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-noir">Écrit le {formaterJourComplet(t.creeLe)}</span>
        {t.valide ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-clair px-2 py-0.5 text-[11px] font-semibold text-noir">
            <CircleCheck aria-hidden className="size-3.5" />
            Affiché aux participants
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-orange px-2 py-0.5 text-[11px] font-semibold text-noir">
            <Clock aria-hidden className="size-3.5" />
            Envoyé, non affiché
          </span>
        )}
        {t.confidentiel ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-noir px-2 py-0.5 text-[11px] font-semibold text-white">
            <Lock aria-hidden className="size-3.5" />
            Confidentiel
          </span>
        ) : null}
      </p>
      <p className="mt-2 whitespace-pre-line text-sm font-semibold leading-relaxed text-noir [overflow-wrap:anywhere]">« {t.texte} »</p>

      {t.valide ? null : (
        <div className="mt-3 flex flex-col gap-3 border-t border-black/10 pt-3">
          <details>
            <summary className="cursor-pointer text-sm font-semibold text-noir underline">Modifier</summary>
            <div className="mt-3">
              <FormulaireTemoignage existant={{ id: t.id, texte: t.texte, confidentiel: t.confidentiel }} />
            </div>
          </details>
          <RetirerTemoignage id={t.id} />
        </div>
      )}
    </li>
  );
}

/** Écrire un témoignage, puis l'historique de ses témoignages. Lit les données de la personne : sous <Suspense>. */
export async function MonTemoignage() {
  const [personne, miens] = await Promise.all([obtenirPersonne(), lireMesTemoignages()]);
  const prenom = personne.prenom.trim() || "Participant";

  return (
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <section id="mon-temoignage" className="accueil-carte scroll-mt-4 p-5 sm:p-7" aria-labelledby="titre-ecrire">
        <h2 id="titre-ecrire" className="titre-charte flex items-center gap-2.5 text-2xl sm:text-3xl">
          <PenLine aria-hidden className="size-6 text-accent" />
          Écrire un témoignage
        </h2>
        <p className="mb-4 mt-2 text-sm">
          Après une session, notez ce qui vous a parlé. S&apos;il est affiché, il le sera sous votre prénom, « {prenom} », avec sa date.
        </p>
        <FormulaireTemoignage />
      </section>

      <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-historique">
        <h2 id="titre-historique" className="titre-charte flex items-center gap-2.5 text-2xl sm:text-3xl">
          <History aria-hidden className="size-6 text-accent" />
          Mes témoignages
        </h2>
        {miens.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-3">
            {miens.map((t) => (
              // La clé change quand le contenu change : le formulaire « Modifier » repart des valeurs enregistrées
              <Ligne key={`${t.id}-${t.valide}-${t.confidentiel}-${t.texte}`} t={t} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm font-semibold">Vous n&apos;avez pas encore écrit de témoignage.</p>
        )}
      </section>
    </div>
  );
}

export function MonTemoignageChargement() {
  return <div className="h-56 rounded-[1.25rem] bg-black/10 motion-safe:animate-pulse" role="status" aria-label="Chargement…" />;
}
