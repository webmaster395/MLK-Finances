import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { CalendrierMois } from "@/components/sessions/calendrier-mois";
import { CalendrierChargement } from "@/components/sessions/calendrier-chargement";
import { formaterHoraires } from "@/lib/format";
import { aujourdhuiParis, lireSeances } from "@/lib/donnees/sessions";

export const metadata: Metadata = { title: "Sessions" };

export default function Page({ searchParams }: PageProps<"/sessions">) {
  return (
    <div className="flex flex-col gap-4">
      <TitrePage titre="Sessions" sousTitre="Votre calendrier et vos cours" />
      {/* Le calendrier lit les données de la personne et l'adresse : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<CalendrierChargement />}>
        <Calendrier searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Calendrier({ searchParams }: { searchParams: PageProps<"/sessions">["searchParams"] }) {
  const [seances, parametres] = await Promise.all([lireSeances(), searchParams]);
  const aujourdhui = aujourdhuiParis();
  const prochainJour = seances.find((s) => !s.passee)?.jour ?? null;

  // Jour affiché au départ : celui de l'adresse (?jour=2026-12-05), sinon la prochaine journée, sinon aujourd'hui
  const demande = typeof parametres.jour === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parametres.jour) ? parametres.jour : null;
  const jourInitial = demande ?? prochainJour ?? aujourdhui;

  return (
    <CalendrierMois
      aujourdhui={aujourdhui}
      jourInitial={jourInitial}
      prochainJour={prochainJour}
      seances={seances.map((s) => ({
        id: s.id,
        titre: s.titre,
        jour: s.jour,
        horaires: formaterHoraires(s.debut, s.fin),
        lieu: s.lieu,
        rubrique: s.rubrique,
        intervenants: s.intervenants,
        coursTitre: s.cours?.titre ?? null,
        aPreparer: s.aPreparer,
        passee: s.passee,
      }))}
    />
  );
}
