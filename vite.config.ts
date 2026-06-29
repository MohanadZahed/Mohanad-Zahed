import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { version } from './package.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Inject the package.json version at build time as a global constant.
  // Avoids shipping the whole package.json to the client.
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
})
