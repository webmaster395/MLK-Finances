/** Titre d'une page de l'espace connecté : titre de la charte avec pinceau rose + sous-titre. */
export function TitrePage({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div>
      <h1 className="titre-charte text-3xl sm:text-5xl lg:text-6xl">
        <span className="pinceau">{titre}</span>
      </h1>
      {sousTitre ? <p className="mt-2 font-titre text-lg font-medium tracking-wide sm:mt-3 sm:text-2xl lg:text-3xl">{sousTitre}</p> : null}
    </div>
  );
}
