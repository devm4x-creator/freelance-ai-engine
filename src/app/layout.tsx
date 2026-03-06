import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { Space_Grotesk, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";

// Load fonts with next/font for optimal performance
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false, // Only load when needed
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0f" },
  ],
};

export const metadata: Metadata = {
  title: "AI Freelancer - Make Money with AI-Powered Tools for Arab Freelancers",
  description: "The ultimate AI platform for Arab freelancers. Generate proposals, create branding, build portfolios, and close more clients — all in Arabic & English.",
  keywords: "freelance, AI, Arab, Algeria, proposals, branding, portfolio, contracts, social media, freelancer tools",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/logo.svg",
  },
  openGraph: {
    title: "AI Freelancer - Make Money with AI",
    description: "The ultimate AI platform for Arab freelancers",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${ibmPlexArabic.variable}`}
    >
      <body className="antialiased">
        <AuthProvider>
          <AppProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
