import { defineConfig } from "vite";
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // root: './src/app.html',
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_VALUE,
  
    rollupOptions: {
      input: "./src/entry/app.ts",
      output: {
        format: "iife",
        dir: "./build",
        // assetFileNames: (entry) => entry.name?.replace(/\.ts$/, ".js") ?? "",
        inlineDynamicImports: true,
        entryFileNames: "app.js",
        assetFileNames: "[name].[ext]",
      },
    },
    minify: true,
    emptyOutDir: true,
  },

  plugins: [
    svelte({
      compilerOptions: {
        css: "injected",
        runes: true,
        preserveComments: false,
        preserveWhitespace: false,
      }
    }),
  ]
});