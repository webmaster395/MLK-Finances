import Link from "next/link";

/** Logo MLK Parcours Finances (texte + trait de pinceau de la charte). */
export function Logo({ lien = "/" }: { lien?: string }) {
  return (
    <Link href={lien} className="logo" aria-label="MLK Parcours Finances — accueil">
      <span className="logo-mlk">MLK</span>
      <span className="logo-parcours">Parcours</span>
      <span className="logo-finances">Finances</span>
    </Link>
  );
}
