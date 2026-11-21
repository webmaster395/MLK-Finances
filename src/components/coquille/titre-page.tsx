/** Titre d'une page de l'espace connecté : titre de la charte avec pinceau rose + sous-titre. */
export function TitrePage({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div>
      <h1 className="titre-charte text-5xl sm:text-6xl">
        <span className="pinceau">{titre}</span>
      </h1>
      {sousTitre ? <p className="mt-3 font-titre text-2xl font-medium tracking-wide sm:text-3xl">{sousTitre}</p> : null}
    </div>
  );
}
