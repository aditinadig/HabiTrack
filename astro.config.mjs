import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  vite: {
    ssr: {
      noExternal: ['@mui/material', '@emotion/react', '@emotion/styled', '@mui/icons-material'],
    },
  },
});