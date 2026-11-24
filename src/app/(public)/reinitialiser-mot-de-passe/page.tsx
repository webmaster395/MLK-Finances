import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CarteAuth, CarteAuthChargement } from "@/components/auth/carte-auth";
import { FormulaireReinitialisation } from "@/components/auth/formulaire-reinitialisation";
import { creerClientServeur } from "@/lib/supabase/serveur";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function Page() {
  return (
    <Suspense fallback={<CarteAuthChargement />}>
      <Contenu />
    </Suspense>
  );
}

/** On arrive ici depuis le lien de l'e-mail : la personne doit avoir une session valide. */
async function Contenu() {
  await connection(); // la vérification de session lit l'heure : à faire au moment de la requête
  const supabase = await creerClientServeur();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return (
      <CarteAuth titre="Lien expiré" sousTitre="Ce lien n'est plus valable">
        <p className="mb-4 font-semibold">Demandez un nouveau lien pour choisir votre mot de passe.</p>
        <Link href="/mot-de-passe-oublie" className="btn btn-principal w-full">
          Demander un nouveau lien
        </Link>
      </CarteAuth>
    );
  }

  return (
    <CarteAuth titre="Nouveau mot de passe" sousTitre="Choisissez votre nouveau mot de passe">
      <FormulaireReinitialisation />
    </CarteAuth>
  );
}
