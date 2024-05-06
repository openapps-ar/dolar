import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { appCode } from './src/vite/app-code-plugin';

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    minify: true,
    emptyOutDir: true,
  },

  plugins: [
    svelte({
      // preprocess: preprocess({
        // postcss: {
        //   plugins: [
        //     autoprefixer,
        //     cssnano,
        //   ],
        // }
      // }),
      compilerOptions: {
        runes: true,
        preserveComments: false,
        preserveWhitespace: false,
      }
    }),
    appCode(),
  ]
});


