import { TitrePage } from "@/components/coquille/titre-page";
import { ListeSessionsChargement } from "@/components/sessions/liste-sessions";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Sessions" sousTitre="Le calendrier de votre parcours" />
      <ListeSessionsChargement />
    </div>
  );
}
