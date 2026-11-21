import { TitrePage } from "@/components/coquille/titre-page";
import { ProfilChargement } from "@/components/profil/profil-chargement";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Profil" sousTitre="Vos informations" />
      <ProfilChargement />
    </div>
  );
}
