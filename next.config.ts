import type { NextConfig } from "next";

// Cache Components desactivado: es una herramienta interna, siempre dinámica y con datos por usuario.
const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
