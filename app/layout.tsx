import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vestibular FGV — navegação generativa",
  description: "Protótipo de navegação generativa para a jornada do candidato de graduação.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
