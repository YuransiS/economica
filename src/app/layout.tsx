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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '925687026840653');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=925687026840653&ev=PageView&noscript=1"
          />
        </noscript>
      </head>
      <body
        className={`${fontMontserrat.variable} ${fontArimo.variable} ${fontNarrow.variable} ${fontScript.variable} font-montserrat antialiased bg-[#1A0000] text-gray-100 min-h-screen flex flex-col overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
