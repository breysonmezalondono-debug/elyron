import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // En desarrollo, aceptar conexiones de la red local (p. ej. abrir la app
  // desde un celular). En producción esto no aplica (se sirve estático).
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replaceAll('\\\\', '/');
          if (!normalizedId.includes('/node_modules/')) return undefined;
          if (/\/react(?:-dom|-router|-router-dom)?\//.test(normalizedId)) return 'react';
          if (normalizedId.includes('/lucide-react/')) return 'icons';
          if (normalizedId.includes('/recharts/')) return 'charts';
          if (normalizedId.includes('/framer-motion/')) return 'motion';
          if (normalizedId.includes('/react-markdown/')) return 'markdown';
          return undefined;
        },
      },
    },
  },
})
