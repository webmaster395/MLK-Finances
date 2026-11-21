"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

const CLE = "theme";
const EVENEMENT = "theme-change";
const ID_CONTENEUR = "espace-connecte";

/** Applique le thème au conteneur de l'espace connecté (les pages publiques restent claires). */
function appliquer(sombre: boolean) {
  document.getElementById(ID_CONTENEUR)?.setAttribute("data-theme", sombre ? "sombre" : "clair");
}

function lireSombre() {
  return document.getElementById(ID_CONTENEUR)?.getAttribute("data-theme") === "sombre";
}

function abonner(rappel: () => void) {
  window.addEventListener(EVENEMENT, rappel);
  return () => window.removeEventListener(EVENEMENT, rappel);
}

/**
 * Script exécuté avant l'affichage : applique le thème enregistré (ou, à défaut, celui du système)
 * pour éviter un flash de couleurs au chargement. Placé dans le conteneur #espace-connecte.
 */
export const SCRIPT_THEME = `(function(){try{var t=localStorage.getItem("${CLE}");if(t!=="sombre"&&t!=="clair"){t=matchMedia("(prefers-color-scheme: dark)").matches?"sombre":"clair"}document.getElementById("${ID_CONTENEUR}").setAttribute("data-theme",t)}catch(e){}})()`;

/** Bouton clair / sombre. Le choix est mémorisé sur cet appareil. */
export function BasculeTheme() {
  const sombre = useSyncExternalStore(abonner, lireSombre, () => false);

  function basculer() {
    const suivant = !lireSombre();
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
      className="flex size-10 items-center justify-center rounded-md border border-black/25 bg-white text-noir hover:bg-black/5"
    >
      {sombre ? <Sun aria-hidden className="size-5" /> : <Moon aria-hidden className="size-5" />}
    </button>
  );
}
