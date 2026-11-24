import { CalendarDays, Megaphone } from "lucide-react";
import { EtatVide } from "@/components/coquille/etat-vide";
import { lireMessages } from "@/lib/donnees/annonces";
import { formaterJourComplet } from "@/lib/format";

const COULEURS_BORDURE = ["#6b78f5", "#e95609"];

/** Liste complète des messages de l'équipe (du plus récent au plus ancien). Lit la base : sous <Suspense>. */
export async function ListeMessages() {
  const messages = await lireMessages();

  if (messages.length === 0) {
    return (
      <EtatVide
        icone={Megaphone}
        titre="Aucun message pour le moment"
        texte="Les annonces et informations importantes de l'équipe apparaîtront ici dès qu'elles seront publiées."
      />
    );
  }

  return (
    <section className="accueil-carte p-5 sm:p-7" aria-labelledby="titre-liste-messages">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm">Annonces du parcours</p>
          <h2 id="titre-liste-messages" className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">
            Messages de l&apos;équipe
          </h2>
        </div>
        <span className="rounded-full bg-black/5 px-3.5 py-1.5 text-xs font-semibold tracking-[0.06em] text-noir">
          {messages.length} message{messages.length > 1 ? "s" : ""}
        </span>
      </div>

      <hr className="my-4 border-black/10" />

      <ul className="flex flex-col gap-3">
        {messages.map((m, index) => {
          const estPlusRecent = index === 0;
          return (
            <li
              key={m.id}
              className="flex flex-col gap-2.5 rounded-lg border border-l-4 border-black/15 bg-white/40 p-4 sm:p-5"
              style={{ borderLeftColor: COULEURS_BORDURE[index % COULEURS_BORDURE.length] }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <CalendarDays aria-hidden className="size-3.5 shrink-0 text-accent" />
                  <span>Publié le {formaterJourComplet(m.cree_le)}</span>
                </span>
                {estPlusRecent ? (
                  <span className="rounded-full bg-accent-clair px-3 py-0.5 text-[11px] font-semibold text-noir">
                    Dernier message
                  </span>
                ) : null}
              </div>

              {m.titre ? (
                <h3 className="text-base font-semibold leading-snug text-noir sm:text-lg [overflow-wrap:anywhere]">
                  {m.titre}
                </h3>
              ) : null}

              <p className="whitespace-pre-line text-sm font-semibold leading-relaxed [overflow-wrap:anywhere]">
                {m.message}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Squelette pendant le chargement de la liste des messages. */
export function ListeMessagesChargement() {
  return (
    <section className="accueil-carte p-5 sm:p-7" role="status" aria-live="polite">
      <span className="sr-only">Chargement des messages…</span>
      <p className="text-xs sm:text-sm">Annonces du parcours</p>
      <h2 className="titre-charte mt-1 text-2xl !leading-tight sm:text-3xl lg:text-4xl">Messages de l&apos;équipe</h2>
      <hr className="my-4 border-black/10" />
      <div className="flex flex-col gap-3 motion-safe:animate-pulse">
        {[0, 1].map((i) => (
          <div key={i} className="h-28 rounded-lg bg-black/10" />
        ))}
      </div>
    </section>
  );
}
