import { redirect } from "next/navigation";

// Les cours sont fusionnés avec les séances : la liste des cours est dans le calendrier.
export default function Page() {
  redirect("/sessions");
}
