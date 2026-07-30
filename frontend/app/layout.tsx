import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Saqib Ahmad Siddiqui | AI/ML & Software Engineer",
  description: "Results-driven AI/ML & Software Engineer specializing in System Architecture, System Design, RAG, Generative AI, Microservices, Artificial Intelligence (AI), Machine Learning (ML) & Data Science, Oracle technologies.",
  verification: {google: "D6vPNWFUc7zRgYiof7JpNgm4zzPN2khlCJOtoHK-DhI",},
  keywords: ["Saqib Ahmad Siddiqui","AI Engineer","Software Engineer","ML Engineer","Python","FastAPI","System Architecture","System Design","RAG","LLM","Generative AI","Machine Learning (ML)","Deep Learning (DL)","Natural Language Processing (NLP)","Microservices","RestAPI","Artificial Intelligence (AI)","Data Science","NFC IET"],
  authors: [{ name: "Saqib Ahmad Siddiqui" }],
  openGraph: {
    title: "Saqib Ahmad Siddiqui | AI/ML & Software Engineer",
    description: "Software Engineer | Python | AI/ML & Data Science",
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
