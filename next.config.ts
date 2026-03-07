import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PDFKit accède au système de fichiers pour charger ses polices.
  // Sans cette option, Vercel le bundle avec Webpack et casse ces accès → crash 500.
  serverExternalPackages: ['pdfkit'],
};

export default nextConfig;
