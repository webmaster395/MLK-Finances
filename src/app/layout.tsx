import type { Metadata } from "next";
import { Antonio, Inter } from "next/font/google";
import "./globals.css";

const antonio = Antonio({
  variable: "--font-antonio",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Police simple et sobre pour tout le site (Antonio ne sert plus qu'au logo)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MLK Parcours Finances",
    template: "%s — MLK Parcours Finances",
  },
  description: "Portail des participants du parcours MLK Parcours Finances.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${antonio.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
