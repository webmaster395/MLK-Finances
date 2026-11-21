import Image from "next/image";
import Link from "next/link";

const TUILES = [
  {
    titre: "Mes cours",
    bouton: "Consulter",
    href: "/cours",
    couleur: "btn-rose",
    image: "/images/cours.webp",
    taille: [675, 420],
    classe: "tuile-accueil__photo--cours",
  },
  {
    titre: "Mes devoirs",
    bouton: "Voir les devoirs",
    href: "/devoirs",
    couleur: "btn-orange",
    image: "/images/devoirs.webp",
    taille: [735, 450],
    classe: "tuile-accueil__photo--devoirs",
  },
  {
    titre: "Ressources",
    bouton: "Ouvrir les ressources",
    href: "/ressources",
    couleur: "btn-rose",
    image: "/images/ressources.webp",
    taille: [825, 390],
    classe: "tuile-accueil__photo--ressources",
  },
] as const;

/** Les trois accès rapides de la maquette : cours, devoirs, ressources. */
export function TuilesAccueil() {
  return (
    <div className="grid gap-2 lg:grid-cols-3">
      {TUILES.map((t) => (
        <section key={t.href} className="accueil-carte tuile-accueil">
          <h2 className="titre-charte text-[2rem] !leading-tight">{t.titre}</h2>
          <Image
            src={t.image}
            alt=""
            width={t.taille[0]}
            height={t.taille[1]}
            sizes="(min-width: 1024px) 25vw, 60vw"
            className={`tuile-accueil__photo ${t.classe}`}
          />
          <Link href={t.href} className={`btn ${t.couleur}`}>
            {t.bouton}
          </Link>
        </section>
      ))}
    </div>
  );
}
