import Link from "next/link";
import { Megaphone } from "lucide-react";
import { lireDernierMessage } from "@/lib/donnees/annonces";

const formaterDate = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });

/** Dernier message de l'équipe (écrit par les administrateurs). Lit la base : sous <Suspense>. */
export async function MessageEquipe() {
  const message = await lireDernierMessage();

  return (
    <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-message">
      <h2 id="titre-message" className="titre-charte flex items-center gap-2.5 text-xl sm:text-2xl">
        <Megaphone aria-hidden className="size-5 text-accent" />
        Message de l&apos;équipe
      </h2>
      {message ? (
        <div className="mt-3 flex flex-col gap-2">
          {message.titre ? <p className="text-base font-semibold text-noir [overflow-wrap:anywhere]">{message.titre}</p> : null}
          <p className="whitespace-pre-line text-sm font-semibold leading-relaxed [overflow-wrap:anywhere]">{message.message}</p>
          <p className="text-xs">Publié le {formaterDate.format(new Date(message.cree_le))}</p>
          <Link href="/messages" className="mt-1 inline-block text-sm font-semibold text-noir underline underline-offset-2">
            Voir tous les messages →
          </Link>
        </div>
      ) : (
        <p className="mt-3 text-sm font-semibold">Aucun message pour le moment.</p>
      )}
    </section>
  );
}

export function MessageEquipeChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-6" role="status" aria-live="polite">
      <span className="sr-only">Chargement du message…</span>
      <h2 className="titre-charte flex items-center gap-2.5 text-2xl">
        <Megaphone aria-hidden className="size-5 text-accent" />
        Message de l&apos;équipe
      </h2>
      <div className="mt-3 flex flex-col gap-2 motion-safe:animate-pulse">
        <div className="h-4 w-2/3 rounded bg-black/10" />
        <div className="h-4 w-full rounded bg-black/10" />
        <div className="h-4 w-5/6 rounded bg-black/10" />
      </div>
    </section>
  );
}
