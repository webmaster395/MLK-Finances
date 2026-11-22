import type { Metadata } from "next";
import { Suspense } from "react";
import { TitrePage } from "@/components/coquille/titre-page";
import { ListeMessages, ListeMessagesChargement } from "@/components/messages/liste-messages";

export const metadata: Metadata = { title: "Messages" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <TitrePage titre="Messages" sousTitre="Les annonces et informations de l'équipe" />
      {/* La liste lit la base : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeMessagesChargement />}>
        <ListeMessages />
      </Suspense>
    </div>
  );
}
