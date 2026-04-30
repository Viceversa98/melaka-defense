import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alifasraf.asia"),
  title: {
    default: "Melaka Defense with JavaScript",
    template: "%s | Melaka Defense",
  },
  description:
    "Play Melaka Defense, a browser strategy game where you defend a fort by programming cannon logic with visual blocks and generated JavaScript.",
  keywords: [
    "Melaka Defense",
    "JavaScript game",
    "coding game",
    "browser strategy game",
    "programming game",
    "learn JavaScript",
    "tower defense coding",
  ],
  authors: [{ name: "alifasraf.asia", url: "https://alifasraf.asia" }],
  creator: "alifasraf.asia",
  publisher: "alifasraf.asia",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://alifasraf.asia",
    siteName: "Melaka Defense",
    title: "Melaka Defense with JavaScript",
    description:
      "Defend the Melaka fort with visual strategy blocks and generated JavaScript in a browser-based coding game.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melaka Defense with JavaScript",
    description:
      "Defend the Melaka fort with visual strategy blocks and generated JavaScript in a browser-based coding game.",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
