import Link from "next/link";
import { Logo } from "@/components/logo";

export default function Page() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <Logo />
      <h1 className="titre-charte text-5xl sm:text-6xl">
        <span className="pinceau">Bientôt disponible</span>
      </h1>
      <p className="max-w-md font-semibold">
        Le portail des participants est en construction. Les premières pages arrivent lot par lot.
      </p>
      <Link href="/charte" className="btn btn-orange">
        Voir la charte graphique
      </Link>
    </main>
  );
}
