/** En-tête noir d'une page de l'espace connecté : surtitre, grand titre blanc et phrase d'explication. */
export function TitrePage({ titre, sousTitre, surtitre = "PARCOURS FINANCES" }: { titre: string; sousTitre?: string; surtitre?: string }) {
  return (
    <div className="rounded-[1.25rem] bg-[#0b0b10] p-5 text-white shadow-md sm:p-8">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70">{surtitre}</p>
      <h1 className="titre-charte mt-2 text-3xl !leading-[1.05] !text-white sm:text-5xl [overflow-wrap:anywhere]">{titre}</h1>
      {sousTitre ? <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">{sousTitre}</p> : null}
    </div>
  );
}
