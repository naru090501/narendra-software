import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { resolveSiteUrl } from "@/lib/site-url";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const siteUrl = resolveSiteUrl("http://localhost:3000");

export const metadata: Metadata = {
  ...(siteUrl
    ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } }
    : {}),
  title: {
    default: "Narendra Software — Free & Local-First Web & Windows Utilities",
    template: "%s | Narendra Software",
  },
  description:
    "A personal software project providing 100% free, local-first web utilities and native Windows tools for everyone. Zero tracking, zero forced sign-ups.",
  keywords: [
    "Narendra Software",
    "Free Developer Tools",
    "Developer Toolbox",
    "Document Tools",
    "Image Tools",
    "Security Tools",
    "Windows Utilities",
    "Local-first software",
    "Free software",
  ],
  openGraph: {
    title: "Narendra Software — Free & Local-First Web & Windows Utilities",
    description:
      "A personal software project providing 100% free, local-first web utilities and native Windows tools for everyone.",
    type: "website",
    siteName: "Narendra Software",
  },
};

const THEME_INIT_SCRIPT = `
(function() {
  try {
    var stored = localStorage.getItem('ns-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var useDark = stored ? stored === 'dark' : true || prefersDark;
    document.documentElement.classList.toggle('dark', useDark);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
