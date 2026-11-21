import { Logo } from "@/components/logo";

/** Coquille des pages publiques : logo au-dessus d'une carte centrée, sans menu. */
export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <main
      id="contenu"
      className="flex flex-1 flex-col items-center justify-center gap-8 bg-[url('/images/hero-fond.webp')] bg-cover bg-center px-4 py-10"
    >
      <Logo lien="/connexion" />
      {children}
    </main>
  );
}
