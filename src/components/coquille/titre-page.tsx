/** Titre d'une page de l'espace connecté : grand titre noir + sous-titre gris, style épuré. */
export function TitrePage({ titre, sousTitre }: { titre: string; sousTitre?: string }) {
  return (
    <div>
      <h1 className="titre-charte text-3xl sm:text-4xl lg:text-5xl">{titre}</h1>
      {sousTitre ? <p className="mt-1.5 text-lg font-semibold tracking-tight text-doux sm:text-2xl lg:text-3xl">{sousTitre}</p> : null}
    </div>
  );
}
