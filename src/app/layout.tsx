import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOOKS LAB",
  description: "Laboratorio de investigación y generación estratégica de hooks en español.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
