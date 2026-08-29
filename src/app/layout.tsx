import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plataforma de Educação Financeira",
  description: "Plataforma gratuita de educação financeira.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-neutral-50 text-neutral-950 antialiased">
        {children}
      </body>
    </html>
  );
}
