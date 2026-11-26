import type { Metadata } from "next";
import { Antonio, Poppins } from "next/font/google";
import "./globals.css";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Polices d'origine (choix de l'utilisateur) : Antonio pour les titres, Poppins pour le texte
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DESCRIPTION = "(Re)prendre le contrôle de mes finances : 6 samedis en visioconférence avec l'Église MLK.";

export const metadata: Metadata = {
  title: {
    default: "MLK Parcours Finances",
    template: "%s — MLK Parcours Finances",
  },
  description: DESCRIPTION,
  // Aperçu affiché quand le lien est partagé (WhatsApp, Facebook…). L'image est src/app/opengraph-image.jpg ;
  // son adresse complète est calculée par Next.js à partir de l'adresse Vercel.
  openGraph: {
    title: "MLK Parcours Finances",
    description: DESCRIPTION,
    siteName: "MLK Parcours Finances",
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${antonio.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
