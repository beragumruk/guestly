import { defineConfig } from "vite";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        product: resolve(import.meta.dirname, "product.html"),
        demo: resolve(import.meta.dirname, "demo.html"),
        pricing: resolve(import.meta.dirname, "pricing.html"),
        impact: resolve(import.meta.dirname, "impact.html"),
        about: resolve(import.meta.dirname, "about.html"),
        trust: resolve(import.meta.dirname, "trust.html"),
        contact: resolve(import.meta.dirname, "contact.html"),
        faq: resolve(import.meta.dirname, "faq.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
        terms: resolve(import.meta.dirname, "terms.html"),
        notFound: resolve(import.meta.dirname, "404.html"),
      },
    },
  },
});
