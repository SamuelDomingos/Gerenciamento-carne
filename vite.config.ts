import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    outDir: 'dist', // O build vai pra pasta dist (padrão do Vite)
    emptyOutDir: true, // Limpa a pasta antes de cada build
  },
});
