/* ============================================================
   MLK Parcours Finances — menu commun et contenus des pages
   ============================================================ */

// ---- Menu (identique sur toutes les pages) ----
const PAGES = [
  ["index.html", "Accueil", "home", true],
  ["sessions.html", "Sessions", "calendar_month"],
  ["cours.html", "Cours", "menu_book"],
  ["devoirs.html", "Devoirs", "edit_document"],
  ["ressources.html", "Ressources", "folder_open"],
  ["temoignages.html", "Témoignages", "chat"],
];
const courant = location.pathname.split("/").pop() || "index.html";
const sidebar = document.getElementById("sidebar");
sidebar.innerHTML =
  '<a class="logo" href="index.html" aria-label="MLK Parcours Finances — accueil">' +
  '<span class="logo-mlk">MLK</span><span class="logo-parcours">Parcours</span><span class="logo-finances">Finances</span></a>' +
  '<button class="menu-btn" type="button" aria-label="Ouvrir le menu" aria-expanded="false"><span class="icone">menu</span></button>' +
  '<nav class="nav">' +
  PAGES.map(([url, nom, icone]) => {
    const actif = url === courant;
    return `<a href="${url}" class="${actif ? "actif" : ""}"${actif ? ' aria-current="page"' : ""}>` +
      `<span class="icone${icone === "home" ? " pleine" : ""}" aria-hidden="true">${icone}</span>${nom}</a>`;
  }).join("") +
  "</nav>";
const boutonMenu = sidebar.querySelector(".menu-btn");
boutonMenu.addEventListener("click", () => {
  const ouvert = sidebar.classList.toggle("ouvert");
  boutonMenu.setAttribute("aria-expanded", ouvert);
  boutonMenu.querySelector(".icone").textContent = ouvert ? "close" : "menu";
});

// ---- Contenus modifiables : remplace ces exemples par les vraies informations ----
const DONNEES = {
  sessions: [
    { titre: "Session 1 — Bases de la gestion financière", date: "À définir", lieu: "À définir" },
    { titre: "Session 2 — Budget et épargne", date: "À définir", lieu: "À définir" },
    { titre: "Session 3 — Investir et projets", date: "À définir", lieu: "À définir" },
  ],
  cours: [
    { titre: "Module 1 — Comprendre son budget", desc: "Revenus, dépenses, objectifs." },
    { titre: "Module 2 — Épargner efficacement", desc: "Fonds d'urgence, épargne régulière." },
    { titre: "Module 3 — Crédit et endettement", desc: "Lire un contrat, éviter les pièges." },
    { titre: "Module 4 — Faire grandir son argent", desc: "Notions de base sur l'investissement." },
  ],
  devoirs: [
    { titre: "Établir mon budget mensuel", echeance: "À définir" },
    { titre: "Fixer mon objectif d'épargne", echeance: "À définir" },
    { titre: "Analyser une offre de crédit", echeance: "À définir" },
  ],
  ressources: [
    { titre: "Modèle de budget (tableur)", type: "Fichier" },
    { titre: "Glossaire de la finance personnelle", type: "PDF" },
    { titre: "Liens utiles et sites officiels", type: "Liens" },
  ],
  temoignages: [
    { nom: "Participant 1", photo: "images/temoin1.webp", texte: "Ce parcours m'a aidé à y voir clair dans mon budget." },
    { nom: "Participante 2", photo: "images/temoin2.webp", texte: "Des cours simples et concrets, j'ai enfin un plan d'épargne." },
    { nom: "Participant 3", photo: "images/temoin3.webp", texte: "Un accompagnement motivant du début à la fin." },
  ],
};

function remplir(id, html) { const e = document.getElementById(id); if (e) e.innerHTML = html; }

remplir("liste-sessions", DONNEES.sessions.map(s =>
  `<li class="carte"><div><h2>${s.titre}</h2><p>${s.date} · ${s.lieu}</p></div><span class="etiquette">Bientôt</span></li>`).join(""));
remplir("liste-cours", DONNEES.cours.map((c, i) =>
  `<li class="carte"><div><h2>${c.titre}</h2><p>${c.desc}</p></div><a class="btn ${i % 2 ? "orange" : "rose"}" href="#">Consulter</a></li>`).join(""));
remplir("liste-devoirs", DONNEES.devoirs.map((d, i) =>
  `<li class="carte"><div><h2>${d.titre}</h2><p>Échéance : ${d.echeance}</p></div><label class="coche"><input type="checkbox" data-i="${i}"> Fait</label></li>`).join(""));
remplir("liste-ressources", DONNEES.ressources.map((r, i) =>
  `<li class="carte"><div><h2>${r.titre}</h2><p>${r.type}</p></div><a class="btn ${i % 2 ? "orange" : "rose"}" href="#">Ouvrir</a></li>`).join(""));
remplir("liste-temoignages", DONNEES.temoignages.map(t =>
  `<article class="carte"><img src="${t.photo}" alt="${t.nom}"><div class="contenu"><blockquote>« ${t.texte} »</blockquote><cite>${t.nom}</cite></div></article>`).join(""));

// Devoirs : la case « Fait » est mémorisée sur l'appareil
document.querySelectorAll("#liste-devoirs input").forEach(c => {
  try { c.checked = localStorage.getItem("devoir" + c.dataset.i) === "1"; } catch (e) {}
  c.addEventListener("change", () => { try { localStorage.setItem("devoir" + c.dataset.i, c.checked ? "1" : "0"); } catch (e) {} });
});
