import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext', // Make sure we can run this bad boy on build
    minify: false, 
  }
});