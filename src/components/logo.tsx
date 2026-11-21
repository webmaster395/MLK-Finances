import Link from "next/link";

/** Logo MLK Parcours Finances (texte + trait de pinceau de la charte). */
export function Logo({
  lien = "/",
  compact = false,
  monogramme = false,
}: {
  lien?: string;
  compact?: boolean;
  /** Affiche uniquement « MLK » avec son trait de pinceau rose (pour le menu latéral replié). */
  monogramme?: boolean;
}) {
  return (
    <Link
      href={lien}
      className={monogramme ? "logo logo-monogramme" : compact ? "logo logo-compact" : "logo"}
      aria-label="MLK Parcours Finances — accueil"
    >
      <span className="logo-mlk">MLK</span>
      {monogramme ? null : (
        <>
          <span className="logo-parcours">Parcours</span>
          <span className="logo-finances">Finances</span>
        </>
      )}
    </Link>
  );
}
