import type { Metadata } from "next";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { TitrePage } from "@/components/coquille/titre-page";
import { FormulaireProfil } from "@/components/profil/formulaire-profil";
import { PhotoProfil } from "@/components/profil/photo-profil";
import { ProfilChargement } from "@/components/profil/profil-chargement";
import { initiales } from "@/lib/auth/initiales";
import { lireProfil } from "@/lib/donnees/profil";

export const metadata: Metadata = { title: "Mon profil" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Profil" sousTitre="Vos informations" />
      {/* Le profil est propre à la personne connectée : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ProfilChargement />}>
        <Contenu />
      </Suspense>
    </div>
  );
}

const formaterMois = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "Europe/Paris" });

async function Contenu() {
  const profil = await lireProfil();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] xl:items-start">
      <div className="flex flex-col gap-4">
        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-photo">
          <h2 id="titre-photo" className="titre-charte mb-4 text-2xl">
            Ma photo
          </h2>
          <PhotoProfil
            participantId={profil.id}
            photoUrl={profil.photoUrl}
            initiales={initiales(profil.prenom, profil.nom, profil.email)}
          />
        </section>

        <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-infos">
          <h2 id="titre-infos" className="titre-charte mb-4 text-2xl">
            Mes informations
          </h2>
          <FormulaireProfil
            email={profil.email}
            civilite={profil.civilite}
            prenom={profil.prenom}
            nom={profil.nom}
            trancheAge={profil.trancheAge}
          />
        </section>
      </div>

      <section className="accueil-carte p-5 sm:p-6" aria-labelledby="titre-formation">
        <h2 id="titre-formation" className="titre-charte mb-4 text-2xl">
          Ma formation
        </h2>
        {profil.formations.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {profil.formations.map((f) => (
              <li key={f.id} className="flex items-start gap-3">
                <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose-clair text-noir">
                  <GraduationCap className="size-5" />
                </span>
                <span className="flex min-w-0 flex-col font-semibold text-noir">
                  <span className="[overflow-wrap:anywhere]">{f.nom}</span>
                  {f.debut || f.fin ? (
                    <span className="text-sm font-normal">
                      {f.debut ? `Du ${formaterMois.format(new Date(f.debut))}` : ""}
                      {f.fin ? ` au ${formaterMois.format(new Date(f.fin))}` : ""}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-semibold">
            Vous n&apos;êtes pas encore rattaché(e) à un groupe. L&apos;équipe le fera prochainement.
          </p>
        )}
      </section>
    </div>
  );
}
