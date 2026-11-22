import type { Metadata } from "next";
import { Suspense } from "react";
import { ChargementPage } from "@/components/admin/chargement";
import { GestionMessages } from "@/components/admin/messages";
import { TitrePage } from "@/components/coquille/titre-page";

export const metadata: Metadata = { title: "Messages — Administration" };

export default function Page() {
  return (
    <div className="flex flex-col gap-5">
      <TitrePage titre="Messages" sousTitre="Les annonces de l’équipe" />
      <Suspense fallback={<ChargementPage />}>
        <GestionMessages />
      </Suspense>
    </div>
  );
}
