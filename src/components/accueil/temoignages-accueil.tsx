import Image from "next/image";
import Link from "next/link";

const PORTRAITS = [
  { src: "/images/temoin1.webp", alt: "Portrait d'un participant", taille: [588, 388] },
  { src: "/images/temoin2.webp", alt: "Portrait d'une participante", taille: [637, 388] },
  { src: "/images/temoin3.webp", alt: "Portrait d'un participant", taille: [637, 388] },
] as const;

/** Aperçu des témoignages (portraits de la maquette ; chaque portrait mène à la page Témoignages). */
export function TemoignagesAccueil() {
  return (
    <section className="accueil-carte temoignages-accueil" aria-labelledby="titre-temoignages">
      <div className="temoignages-accueil__texte">
        <h2 id="titre-temoignages" className="titre-charte text-[2.2rem] !leading-tight">
          Témoignages
        </h2>
        <p className="mt-2 font-semibold">Découvrez les expériences des participants.</p>
      </div>
      {PORTRAITS.map((p, i) => (
        <Link key={p.src} href="/temoignages" className="temoignages-accueil__portrait" aria-label={`${p.alt} — voir les témoignages`}>
          <Image src={p.src} alt="" width={p.taille[0]} height={p.taille[1]} sizes="(min-width: 1024px) 15vw, 30vw" />
          <span className="sr-only">{`Témoignage ${i + 1}`}</span>
        </Link>
      ))}
    </section>
  );
}
