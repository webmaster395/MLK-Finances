"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const CLE = "theme";
const EVENEMENT = "theme-change";
const ID_CONTENEUR = "espace-connecte";

// Copie en mémoire du choix, au cas où le navigateur refuse le stockage
let choixEnMemoire: boolean | null = null;

/**
 * Applique le thème à TOUS les conteneurs de l'espace connecté (les pages publiques restent claires).
 * Next.js garde les pages déjà visitées en arrière-plan : il peut y avoir plusieurs conteneurs en même temps,
 * un seul choix doit valoir pour tous (participant comme administration).
 */
function appliquer(sombre: boolean) {
  document.querySelectorAll(`[id="${ID_CONTENEUR}"]`).forEach((c) => c.setAttribute("data-theme", sombre ? "sombre" : "clair"));
}

/** Le choix de la personne sur cet appareil ; à défaut, le réglage du système. */
function lireSombre() {
  let choix: string | null = null;
  try {
    choix = localStorage.getItem(CLE);
  } catch {}
  if (choix === "sombre" || choix === "clair") return choix === "sombre";
  return choixEnMemoire ?? matchMedia("(prefers-color-scheme: dark)").matches;
}

function abonner(rappel: () => void) {
  // Un changement fait dans un autre onglet du navigateur s'applique aussi ici
  const surAutreOnglet = (e: StorageEvent) => {
    if (e.key !== CLE) return;
    appliquer(lireSombre());
    rappel();
  };
  window.addEventListener(EVENEMENT, rappel);
  window.addEventListener("storage", surAutreOnglet);
  return () => {
    window.removeEventListener(EVENEMENT, rappel);
    window.removeEventListener("storage", surAutreOnglet);
  };
}

/**
 * Script exécuté avant l'affichage : applique le thème enregistré (ou, à défaut, celui du système)
 * pour éviter un flash de couleurs au chargement. Placé dans le conteneur #espace-connecte.
 */
export const SCRIPT_THEME = `(function(){try{var t=localStorage.getItem("${CLE}");if(t!=="sombre"&&t!=="clair"){t=matchMedia("(prefers-color-scheme: dark)").matches?"sombre":"clair"}document.getElementById("${ID_CONTENEUR}").setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * Réapplique le choix à chaque arrivée sur un espace (participant ou administration), y compris quand on revient
 * sur une page gardée en arrière-plan : le script ci-dessus ne s'exécute qu'au chargement depuis le serveur.
 */
export function InitialiserTheme() {
  useLayoutEffect(() => {
    appliquer(lireSombre());
    window.dispatchEvent(new Event(EVENEMENT));
  });
  return null;
}

/** Bouton clair / sombre. Le choix est mémorisé sur cet appareil. */
export function BasculeTheme() {
  const sombre = useSyncExternalStore(abonner, lireSombre, () => false);

  function basculer() {
    const suivant = !lireSombre();
    choixEnMemoire = suivant;
    appliquer(suivant);
    try {
      localStorage.setItem(CLE, suivant ? "sombre" : "clair");
    } catch {}
    window.dispatchEvent(new Event(EVENEMENT));
  }

  return (
    <button
      type="button"
      onClick={basculer}
      aria-pressed={sombre}
      aria-label="Mode sombre"
      title={sombre ? "Passer en mode clair" : "Passer en mode sombre"}
      className="flex size-11 touch-manipulation items-center justify-center rounded-md border border-black/25 bg-white text-noir hover:bg-black/5 md:size-10"
    >
      {sombre ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
    </button>
  );
}
