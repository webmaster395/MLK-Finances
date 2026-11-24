import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/logo";

/** Coquille des pages publiques : présentation avec la photo du parcours et carte centrée, sans menu. */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <main
      id="contenu"
      className="flex flex-1 items-center justify-center bg-fond px-4 py-5 sm:py-8"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,26rem)] lg:gap-10">
        <div className="flex flex-col gap-3 lg:gap-6">
          <div>
            <div className="lg:hidden">
              <Logo lien="/connexion" compact />
            </div>
            <div className="hidden lg:block">
              <Logo lien="/connexion" />
            </div>
          </div>

          <p className="titre-charte hidden text-4xl lg:block xl:text-5xl">
            <span>Bienvenue dans </span>
            <span className="pinceau">votre parcours</span>
          </p>

          <div className="overflow-hidden rounded-[0.65rem] bg-carte/60 shadow-sm">
            <Image
              src="/images/hero.webp"
              alt="Une étudiante souriante, à côté d'un panneau « Apprendre aujourd'hui pour demain »"
              width={1952}
              height={721}
              priority
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-28 w-full object-cover object-[72%_center] sm:h-40 lg:h-auto lg:object-contain"
            />
          </div>

          <Link href="/avis" className="w-fit text-sm font-semibold text-noir underline underline-offset-4 hover:no-underline">
            Lire les témoignages de ceux qui ont suivi le parcours →
          </Link>
        </div>

        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
