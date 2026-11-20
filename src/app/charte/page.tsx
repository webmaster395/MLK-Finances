import type { Metadata } from "next";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "Charte graphique" };

const couleurs = [
  { nom: "Orange", code: "#e95609", classe: "bg-orange" },
  { nom: "Rose", code: "#d634ba", classe: "bg-rose" },
  { nom: "Rose clair", code: "#ecb6e5", classe: "bg-rose-clair" },
  { nom: "Noir", code: "#070707", classe: "bg-noir" },
  { nom: "Texte", code: "#333333", classe: "bg-texte" },
  { nom: "Fond", code: "#e9e9e8", classe: "bg-fond border border-black/10" },
];

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-6 sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-6">
        <Logo />
        <h1 className="titre-charte text-5xl">
          <span className="pinceau">Charte graphique</span>
        </h1>
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
        <p className="titre-charte text-5xl sm:text-6xl">Bienvenue dans votre parcours</p>
        <p className="mt-3 font-titre text-3xl font-medium tracking-wide">MLK Parcours Finances</p>
        <p className="mt-3 font-semibold">
          Texte courant en Poppins : les informations de la prochaine session seront bientôt disponibles.
        </p>
      </section>

      <section className="carte">
        <h2 className="titre-charte mb-4 text-3xl">Boutons</h2>
        <div className="flex flex-wrap gap-3">
          <span className="btn btn-orange">Voir les sessions</span>
          <span className="btn btn-rose">Consulter</span>
        </div>
      </section>
    </main>
  );
}
