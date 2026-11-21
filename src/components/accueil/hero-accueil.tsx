import Image from "next/image";

/** Bandeau d'accueil de la maquette : titre avec pinceau rose et photo avec le panneau. */
export function HeroAccueil() {
  return (
    <section className="hero-accueil" aria-labelledby="titre-accueil">
      <div className="hero-accueil__texte">
        <h1 id="titre-accueil" className="titre-charte">
          <span>Bienvenue dans</span>
          <span className="pinceau">votre parcours</span>
        </h1>
        <p className="hero-accueil__sous">MLK Parcours Finances</p>
      </div>
      <Image
        src="/images/hero.webp"
        alt="Une étudiante souriante, à côté d'un panneau « Apprendre aujourd'hui pour demain »"
        width={1952}
        height={721}
        priority
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="hero-accueil__img"
      />
    </section>
  );
}
