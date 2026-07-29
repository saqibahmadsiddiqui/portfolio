import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Saqib Ahmad Siddiqui | AI & Software Engineer",
  description: "Results-driven Software Engineer specializing in Python, AI & Data Science, Oracle technologies.",
  keywords: ["Saqib Ahmad Siddiqui","AI Software Engineer","Python","Machine Learning","FastAPI"],
  authors: [{ name: "Saqib Ahmad Siddiqui" }],
  openGraph: {
    title: "Saqib Ahmad Siddiqui | AI & Software Engineer",
    description: "Software Engineer | Python | AI & Data Science",
    type: "website",
  },
  icons: { icon: "/api/icon", apple: "/api/icon" },
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Prevent light/dark flash — runs before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var dm = localStorage.getItem('portfolio-theme-mode');
            var dark = dm ? dm === 'dark' : true;
            document.documentElement.style.setProperty('--bg', dark ? '#0f1520' : '#f0f9ff');
          } catch(e) {}
        `}} />
      </head>
      <body style={{ overflowX: "hidden", width: "100%" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
