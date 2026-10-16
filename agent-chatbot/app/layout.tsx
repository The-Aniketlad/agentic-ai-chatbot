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
  title: "Astra AI — Autonomous Multi-Agent Assistant",
  description: "Modern agentic AI chatbot with multi-LLM fallback, specialist routing, and autonomous tools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('astra_theme');
                  var theme = (saved === 'light' || saved === 'dark') ? saved : 'dark';
                  document.documentElement.classList.add(theme);
                  if (theme === 'light') {
                    document.documentElement.style.backgroundColor = '#845fe2';
                    document.documentElement.style.backgroundImage = 'linear-gradient(315deg, #845fe2 0%, #dec9ff 100%)';
                  } else {
                    document.documentElement.style.backgroundColor = '#0b0714';
                    document.documentElement.style.backgroundImage = 'none';
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
