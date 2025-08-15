import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import pandacss from "@pandacss/dev/postcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  server: {
    port: 3000,
  },
  css: {
    postcss: {
      plugins: [pandacss, autoprefixer],
    },
  },

  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({ customViteReactPlugin: true, target: "nodeServer" }),
    viteReact(),
  ],
});
