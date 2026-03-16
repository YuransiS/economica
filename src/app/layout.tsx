import type { Metadata } from "next";
import { Montserrat, Arimo, Roboto_Condensed, Caveat } from "next/font/google";
import "./globals.css";

const fontMontserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const fontArimo = Arimo({
  subsets: ["cyrillic", "latin"],
  variable: "--font-arimo",
  display: "swap",
});

const fontNarrow = Roboto_Condensed({
  subsets: ["cyrillic", "latin"],
  variable: "--font-narrow",
  weight: ["300", "400", "700"],
  display: "swap",
});

const fontScript = Caveat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Як почати інвестувати і накопичити перші 100 000$ | Практикум",
  description: "3 денний онлайн-практикум. Як почати інвестувати і накопичити перші 100 000$ капіталу у 2026 році навіть під час кризи.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="scroll-smooth">
      <head>
        {/* Meta Pixel Code could go here later */}
      </head>
      <body
        className={`${fontMontserrat.variable} ${fontArimo.variable} ${fontNarrow.variable} ${fontScript.variable} font-montserrat antialiased bg-[#1A0000] text-gray-100 min-h-screen flex flex-col overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
