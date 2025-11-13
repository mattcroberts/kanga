import pandacss from "@pandacss/dev/postcss";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	css: {
		postcss: {
			// biome-ignore lint/suspicious/noExplicitAny: bad types
			plugins: [pandacss as any, autoprefixer],
		},
	},
	build: {
		target: "es2022",
	},
	plugins: [
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tanstackStart(),
		nitro({
			config: {
				preset: "aws-lambda",
				compatibilityDate: "2025-11-01",
			},
		}),
		viteReact(),
	],
});
