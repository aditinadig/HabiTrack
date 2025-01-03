import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['@mui/material', '@emotion/react', '@emotion/styled', '@mui/icons-material'],
    },
    optimizeDeps: {
      include: ['dayjs'],
    },
    css: {
      preprocessorOptions: {
        css: {
          additionalData: `@import './src/styles/global.css';`,
        },
      },
    },
  },
  output: 'static', // Set output to 'static' for a purely static build
});