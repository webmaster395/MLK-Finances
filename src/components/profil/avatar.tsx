"use client";

import { useState } from "react";

/**
 * Pastille ronde de la personne : sa photo si elle en a une, sinon ses initiales.
 * Si le lien temporaire de la photo a expiré, on retombe sur les initiales.
 */
export function Avatar({
  photoUrl,
  initiales,
  taille = "size-10",
  texteTaille = "text-lg",
}: {
  photoUrl: string | null;
  initiales: string;
  taille?: string;
  texteTaille?: string;
}) {
  const [echec, setEchec] = useState(false);

  if (photoUrl && !echec) {
    return (
      // Le lien est temporaire et signé : pas d'optimisation d'image Next.js (elle mettrait le lien en cache)
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        onError={() => setEchec(true)}
        className={`${taille} shrink-0 rounded-full bg-black/10 object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`flex ${taille} shrink-0 items-center justify-center rounded-full bg-noir font-titre ${texteTaille} text-white`}
    >
      {initiales}
    </span>
  );
}
