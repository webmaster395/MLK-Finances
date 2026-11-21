import Link from "next/link";
import { CalendarDays, ChevronRight, Clock, MapPin } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { formaterHoraires, partiesDate } from "@/lib/format";
import { lireSessions, type SessionListe } from "@/lib/donnees/sessions";

function CarteSessionListe({ session, prochaine, passee }: { session: SessionListe; prochaine?: boolean; passee?: boolean }) {
  const { jour, mois } = partiesDate(session.debut);

  return (
    <li>
      <Link
        href={`/sessions/${session.id}`}
        className={`accueil-carte group flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:gap-5 sm:p-5 ${
          passee ? "opacity-80" : ""
        }`}
      >
        <span
          aria-hidden
          className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-lg font-titre leading-none sm:size-[4.5rem] ${
            passee ? "bg-black/10 text-noir" : "bg-rose-clair text-noir"
          }`}
        >
          <span className="text-3xl font-bold">{jour}</span>
          <span className="mt-1 text-sm uppercase tracking-wide">{mois}</span>
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="titre-charte text-2xl !leading-tight">{session.titre}</span>
            {prochaine ? (
              <span className="rounded-full bg-orange px-3 py-0.5 text-xs font-semibold text-white">Prochaine session</span>
            ) : null}
          </span>
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
            <span className="flex items-center gap-1.5">
              <Clock aria-hidden className="size-4 shrink-0" />
              {formaterHoraires(session.debut, session.fin)}
            </span>
            {session.lieu ? (
              <span className="flex items-center gap-1.5">
                <MapPin aria-hidden className="size-4 shrink-0" />
                {session.lieu}
              </span>
            ) : null}
          </span>
          {session.cours ? <span className="truncate text-sm">{session.cours.titre}</span> : null}
        </span>
        <ChevronRight aria-hidden className="size-6 shrink-0 text-noir transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

/** Liste des sessions de la personne : à venir, puis passées. Lit ses données : à placer sous <Suspense>. */
export async function ListeSessions() {
  const { aVenir, passees } = await lireSessions();

  if (aVenir.length === 0 && passees.length === 0) {
    return (
      <EtatVide
        icone={CalendarDays}
        titre="Aucune session pour le moment"
        texte="Les sessions de votre parcours apparaîtront ici dès qu'elles seront planifiées."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="titre-a-venir" className="flex flex-col gap-3">
        <h2 id="titre-a-venir" className="titre-charte text-3xl">
          À venir
        </h2>
        {aVenir.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {aVenir.map((s, i) => (
              <CarteSessionListe key={s.id} session={s} prochaine={i === 0} />
            ))}
          </ul>
        ) : (
          <p className="font-semibold">Aucune session à venir pour le moment.</p>
        )}
      </section>

      {passees.length > 0 ? (
        <section aria-labelledby="titre-passees" className="flex flex-col gap-3">
          <h2 id="titre-passees" className="titre-charte text-3xl">
            Passées
          </h2>
          <ul className="flex flex-col gap-2">
            {passees.map((s) => (
              <CarteSessionListe key={s.id} session={s} passee />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

/** Squelette pendant le chargement de la liste. */
export function ListeSessionsChargement() {
  return (
    <div className="flex flex-col gap-2" role="status" aria-live="polite">
      <span className="sr-only">Chargement des sessions…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-24 rounded-[0.65rem] bg-black/10 motion-safe:animate-pulse" />
      ))}
    </div>
  );
}
