/** Titre d'une page de l'espace connecté : grand titre noir + sous-titre gris, style épuré. */
export function TitrePage({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div>
      <h1 className="titre-charte text-3xl sm:text-5xl lg:text-6xl">{titre}</h1>
      {sousTitre ? <p className="mt-1.5 font-titre text-lg font-medium tracking-wide text-doux sm:text-2xl lg:text-3xl">{sousTitre}</p> : null}
    </div>
  );
}
