"use server";

import { redirect } from "next/navigation";
import { creerClientServeur } from "@/lib/supabase/serveur";
import { adresseSite } from "./site";
import { cheminSur } from "./redirection";

/** État renvoyé aux formulaires. Le mot de passe n'est JAMAIS renvoyé. */
export type EtatFormulaire = {
  ok?: boolean;
  message?: string;
  valeurs?: Record<string, string>;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOT_DE_PASSE_MIN = 8;

function texte(formData: FormData, nom: string) {
  const v = formData.get(nom);
  return typeof v === "string" ? v.trim() : "";
}

function motDePasse(formData: FormData, nom: string) {
  const v = formData.get(nom);
  return typeof v === "string" ? v : "";
}

function messageErreurMotDePasse(mdp: string, confirmation: string): string | null {
  if (mdp.length < MOT_DE_PASSE_MIN) return `Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.`;
  if (!/[A-Za-z]/.test(mdp) || !/[0-9]/.test(mdp)) return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  if (mdp !== confirmation) return "Les deux mots de passe ne sont pas identiques.";
  return null;
}

// ---------------------------------------------------------------------------
// Connexion
// ---------------------------------------------------------------------------
export async function connexion(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const email = texte(formData, "email").toLowerCase();
  const mdp = motDePasse(formData, "motdepasse");
  const suivant = cheminSur(formData.get("suivant"));

  if (!EMAIL.test(email) || mdp.length === 0) {
    return { message: "Saisissez votre adresse e-mail et votre mot de passe.", valeurs: { email } };
  }

  const supabase = await creerClientServeur();
  const { error } = await supabase.auth.signInWithPassword({ email, password: mdp });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message: "Votre adresse e-mail n'est pas encore confirmée. Ouvrez le message de confirmation qui vous a été envoyé.",
        valeurs: { email },
      };
    }
    if (error.status === 429 || error.code === "over_request_rate_limit") {
      return { message: "Trop de tentatives. Patientez quelques minutes avant de réessayer.", valeurs: { email } };
    }
    // Même message que l'adresse soit inconnue ou le mot de passe faux (on ne révèle pas quels comptes existent)
    return { message: "Adresse e-mail ou mot de passe incorrect.", valeurs: { email } };
  }

  redirect(suivant);
}

// ---------------------------------------------------------------------------
// Inscription (ouverte, avec confirmation par e-mail)
// ---------------------------------------------------------------------------
export async function inscription(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const prenom = texte(formData, "prenom");
  const nom = texte(formData, "nom");
  const email = texte(formData, "email").toLowerCase();
  const mdp = motDePasse(formData, "motdepasse");
  const confirmation = motDePasse(formData, "confirmation");
  const valeurs = { prenom, nom, email };

  if (prenom.length === 0 || prenom.length > 100 || nom.length === 0 || nom.length > 100) {
    return { message: "Saisissez votre prénom et votre nom (100 caractères au maximum).", valeurs };
  }
  if (!EMAIL.test(email)) return { message: "Saisissez une adresse e-mail valide.", valeurs };
  const erreurMdp = messageErreurMotDePasse(mdp, confirmation);
  if (erreurMdp) return { message: erreurMdp, valeurs };

  const supabase = await creerClientServeur();
  const site = await adresseSite();
  const { error } = await supabase.auth.signUp({
    email,
    password: mdp,
    options: {
      // Seuls le prénom et le nom sont transmis. Le rôle n'est jamais lu ici : tout compte est « participant ».
      data: { prenom, nom },
      emailRedirectTo: `${site}/auth/callback?suivant=/accueil`,
    },
  });

  if (error) {
    if (error.code === "weak_password") {
      return { message: "Ce mot de passe est trop faible. Choisissez-en un plus long et moins courant.", valeurs };
    }
    if (error.status === 429 || error.code === "over_email_send_rate_limit") {
      return { message: "Trop de demandes pour le moment. Patientez quelques minutes avant de réessayer.", valeurs };
    }
    return { message: "Impossible de créer le compte pour le moment. Réessayez dans un instant.", valeurs };
  }

  // Même réponse que l'adresse soit nouvelle ou déjà inscrite (on ne révèle pas quels comptes existent)
  return {
    ok: true,
    message:
      "Votre inscription est enregistrée. Un message de confirmation vient d'être envoyé : ouvrez-le pour activer votre compte, puis connectez-vous.",
  };
}

// ---------------------------------------------------------------------------
// Mot de passe oublié
// ---------------------------------------------------------------------------
export async function motDePasseOublie(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const email = texte(formData, "email").toLowerCase();
  if (!EMAIL.test(email)) return { message: "Saisissez une adresse e-mail valide.", valeurs: { email } };

  const supabase = await creerClientServeur();
  const site = await adresseSite();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${site}/auth/callback?suivant=/reinitialiser-mot-de-passe`,
  });

  if (error && (error.status === 429 || error.code === "over_email_send_rate_limit")) {
    return { message: "Trop de demandes pour le moment. Patientez quelques minutes avant de réessayer.", valeurs: { email } };
  }

  // Même réponse que l'adresse existe ou non
  return {
    ok: true,
    message:
      "Si cette adresse correspond à un compte, un message contenant un lien pour choisir un nouveau mot de passe vient d'être envoyé.",
  };
}

// ---------------------------------------------------------------------------
// Nouveau mot de passe (après le lien reçu par e-mail : la personne est alors connectée)
// ---------------------------------------------------------------------------
export async function reinitialiserMotDePasse(_: EtatFormulaire, formData: FormData): Promise<EtatFormulaire> {
  const mdp = motDePasse(formData, "motdepasse");
  const confirmation = motDePasse(formData, "confirmation");
  const erreurMdp = messageErreurMotDePasse(mdp, confirmation);
  if (erreurMdp) return { message: erreurMdp };

  const supabase = await creerClientServeur();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { message: "Ce lien n'est plus valable. Demandez un nouveau lien depuis « Mot de passe oublié »." };
  }

  const { error } = await supabase.auth.updateUser({ password: mdp });
  if (error) {
    if (error.code === "same_password") return { message: "Choisissez un mot de passe différent de l'ancien." };
    if (error.code === "weak_password") return { message: "Ce mot de passe est trop faible. Choisissez-en un plus long et moins courant." };
    return { message: "Impossible de changer le mot de passe pour le moment. Réessayez dans un instant." };
  }

  redirect("/accueil");
}

// ---------------------------------------------------------------------------
// Déconnexion
// ---------------------------------------------------------------------------
export async function deconnexion() {
  const supabase = await creerClientServeur();
  await supabase.auth.signOut();
  redirect("/connexion");
}
