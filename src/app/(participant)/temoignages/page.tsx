import type { Metadata } from "next";
import { Suspense } from "react";
import { ListeTemoignages, ListeTemoignagesChargement } from "@/components/temoignages/liste-temoignages";
import { MonTemoignage, MonTemoignageChargement } from "@/components/temoignages/mon-temoignage";

export const metadata: Metadata = { title: "Témoignages" };

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      {/* La liste lit la base : sous <Suspense>. Le titre reste statique. */}
      <Suspense fallback={<ListeTemoignagesChargement />}>
        <ListeTemoignages />
      </Suspense>
      <Suspense fallback={<MonTemoignageChargement />}>
        <MonTemoignage />
      </Suspense>
    </div>
  );
}
