import { TitrePage } from "@/components/coquille/titre-page";
import { ListeMessagesChargement } from "@/components/messages/liste-messages";

export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Messages" sousTitre="Les annonces et informations de l'équipe" />
      <ListeMessagesChargement />
    </div>
  );
}
