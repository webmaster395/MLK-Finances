import { TableauDeBordChargement } from "@/components/admin/tableau-de-bord";

export default function Loading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="h-16 w-72 rounded-md bg-black/10 motion-safe:animate-pulse" />
      <TableauDeBordChargement />
    </div>
  );
}
