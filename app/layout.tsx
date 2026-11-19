import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { profile } from "@/content/profile";
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
  title: {
    default: `${profile.name} · Engineering portfolio for HeyMax`,
    template: `%s · ${profile.name}`,
  },
  description:
    "Senior Software Engineer portfolio: rewards & custody, flight booking and an AI data pipeline, prepared for HeyMax.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
          <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <Link
              href="/"
              className="font-semibold tracking-tight text-slate-900"
            >
              {profile.name}
              <span className="ml-2 font-normal text-slate-400">× HeyMax</span>
            </Link>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link href="/#projects" className="hover:text-slate-900">
                Projects
              </Link>
              <Link href="/#fit" className="hover:text-slate-900">
                Why HeyMax
              </Link>
            </div>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
          Prepared by {profile.name} for the HeyMax engineering conversation,
          with slightly more enthusiasm than strictly necessary.
        </footer>
      </body>
    </html>
  );
}
