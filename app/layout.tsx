import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZYFL Formation Lab",
  description: "A football-powered game for learning ZYFL formations and building your own team.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
