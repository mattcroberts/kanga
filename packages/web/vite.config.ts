import pandacss from "@pandacss/dev/postcss";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	css: {
		postcss: {
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
		nitroV2Plugin({
			preset: "aws_lambda",
			compatibilityDate: "2025-10-16",
		}),
		viteReact(),
	],
});
