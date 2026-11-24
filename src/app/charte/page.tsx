import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Charte graphique" };

const couleurs = [
  { nom: "Bleu-violet", code: "#6b78f5", classe: "bg-accent" },
  { nom: "Bleu-violet clair", code: "#dfe3fd", classe: "bg-accent-clair" },
  { nom: "Noir", code: "#0b0b10", classe: "bg-noir" },
  { nom: "Texte", code: "#3b3d4f", classe: "bg-texte" },
  { nom: "Fond", code: "#eceefa", classe: "bg-fond border border-black/10" },
  { nom: "Alerte", code: "#e95609", classe: "bg-orange" },
];

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <Logo />
        <h1 className="titre-charte text-4xl">Charte graphique</h1>
      </header>

      <section className="carte">
        <h2 className="titre-charte mb-4 text-3xl">Couleurs</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {couleurs.map((c) => (
            <li key={c.code}>
              <div className={`h-16 rounded-md ${c.classe}`} />
              <p className="mt-2 text-sm font-semibold">{c.nom}</p>
              <p className="text-xs">{c.code}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="carte">
        <h2 className="titre-charte mb-4 text-3xl">Typographie</h2>
        <p className="titre-charte text-4xl sm:text-5xl">Bienvenue dans votre parcours</p>
        <p className="mt-3 text-2xl font-semibold tracking-tight text-texte/60">MLK Parcours Finances</p>
        <p className="mt-3 font-medium">
          Texte courant en Inter : les informations de la prochaine session seront bientôt disponibles.
        </p>
      </section>

      <section className="carte">
        <h2 className="titre-charte mb-4 text-3xl">Boutons</h2>
        <div className="flex flex-wrap gap-3">
          <span className="btn btn-principal">Voir les sessions</span>
          <span className="btn btn-accent">Consulter</span>
        </div>
      </section>
    </main>
  );
}
