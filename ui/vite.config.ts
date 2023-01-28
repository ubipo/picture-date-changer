import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { env } from 'node:process'
import tailwindCss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  root: 'src',
  clearScreen: false,
  server: {
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    outDir: '../dist',
    target: env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
    // rollupOptions: {
    //   input: {
    //     app: 'src/index.html',
    //   }
    // }
  },
  css: {
    postcss: {
      plugins: [
        tailwindCss({
          content: [
            "./src/index.html",
            "./src/**/*.{ts,tsx}"
          ],
          theme: {
            extend: {},
          },
          plugins: [],
        }),
        autoprefixer(),
      ]
    }
  },
  plugins: [react()],
})
