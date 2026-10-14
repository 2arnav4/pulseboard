import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Inter } from "next/font/google";
import { auth } from "@/auth";
import { AppProviders } from "@/components/providers/AppProviders";
import { THEME_STORAGE_KEY } from "@/lib/persistence";
import "./globals.css";

const bodyFont = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const displayFont = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Pulseboard", template: "%s · Pulseboard" },
  description: "A personalized dashboard for news, movie recommendations and social posts.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#131210" },
  ],
};

/**
 * Runs before first paint: applies the saved theme (or the OS preference) so a
 * dark-mode user never sees a white flash while React hydrates.
 */
const themeScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}if(t==="dark"){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full font-sans">
        <AppProviders session={session}>{children}</AppProviders>
      </body>
    </html>
  );
}
