import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { formaterCreneau } from "@/lib/format";
import { lireProchaineSession } from "@/lib/donnees/sessions";

const Photo = () => (
  <Image
    src="/images/session-photo.webp"
    alt=""
    width={932}
    height={320}
    sizes="100vw"
    className="session-accueil__photo"
  />
);

/** Prochaine session de la personne (lit ses données : à placer sous <Suspense>). */
export async function CarteSession() {
  const session = await lireProchaineSession();

  return (
    <section className="accueil-carte session-accueil" aria-labelledby="titre-session">
      <h2 id="titre-session" className="titre-charte text-[2rem] !leading-tight">
        Prochaine session
      </h2>
      {session ? (
        <div className="mt-2 flex flex-col gap-1 font-semibold">
          <p className="text-lg text-noir">{session.titre}</p>
          <p className="flex items-center gap-2">
            <CalendarDays aria-hidden className="size-4 shrink-0" />
            <span className="first-letter:uppercase">{formaterCreneau(session.debut, session.fin)}</span>
          </p>
          {session.lieu ? (
            <p className="flex items-center gap-2">
              <MapPin aria-hidden className="size-4 shrink-0" />
              {session.lieu}
            </p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 font-semibold">Les informations de la prochaine session seront bientôt disponibles.</p>
      )}
      <Link href="/sessions" className="btn btn-orange mt-4">
        Voir les sessions
      </Link>
      <Photo />
    </section>
  );
}

/** Pendant le chargement : le cadre de la carte, avec des lignes grisées. */
export function CarteSessionChargement() {
  return (
    <section className="accueil-carte session-accueil" role="status" aria-live="polite">
      <span className="sr-only">Chargement de la prochaine session…</span>
      <h2 className="titre-charte text-[2rem] !leading-tight">Prochaine session</h2>
      <div className="mt-3 flex flex-col gap-2 motion-safe:animate-pulse">
        <div className="h-4 w-2/3 max-w-md rounded bg-black/10" />
        <div className="h-4 w-1/2 max-w-xs rounded bg-black/10" />
      </div>
      <div className="btn btn-orange mt-4 opacity-60">Voir les sessions</div>
      <Photo />
    </section>
  );
}
