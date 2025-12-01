import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Separate config for UI to create a single inline HTML file
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  root: path.resolve(__dirname, 'src'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false,
    target: 'es2017',
    minify: 'esbuild',
    rollupOptions: {
      input: path.resolve(__dirname, 'src/ui.html'),
      output: {
        entryFileNames: 'ui-bundle.js',
        assetFileNames: 'ui-bundle.[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
