import type { Metadata } from "next";
import "./globals.css";
import Providers from "../components/Providers";

export const metadata: Metadata = {
  title: "Saqib Ahmad Siddiqui | AI & Software Engineer",
  description: "Results-driven Software Engineer specializing in Python, AI & Data Science, Oracle technologies.",
  keywords: ["Saqib Ahmad Siddiqui","AI Software Engineer","Python","Machine Learning","FastAPI","NFC IET"],
  authors: [{ name: "Saqib Ahmad Siddiqui" }],
  openGraph: {
    title: "Saqib Ahmad Siddiqui | AI & Software Engineer",
    description: "Software Engineer | Python | AI & Data Science",
    type: "website",
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport = { width: "device-width", initialScale: 1, maximumScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ overflowX: "hidden", width: "100%" }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
