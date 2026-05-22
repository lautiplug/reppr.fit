import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { sentryVitePlugin } from '@sentry/vite-plugin'

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? ''
let supabaseOrigin: string | null = null
let supabaseHost: string | null = null

try {
  // Used to loosen CSP during local development when Supabase runs locally over HTTP.
  const u = new URL(supabaseUrl)
  supabaseOrigin = u.origin
  supabaseHost = u.host
} catch {
  // Ignore: missing/invalid env during CI/test.
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    sentryVitePlugin({
      org: 'o4511190448209920',
      project: 'reppr-fit',
      // SENTRY_AUTH_TOKEN must be set in .env.local (never commit)
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Reppr.fit',
        short_name: 'Reppr',
        description: 'Tu app de entrenamiento',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F7F7F5',
        theme_color: '#F7F7F5',
        icons: [
          {
            src: '/repprlogo.png',
            sizes: '1254x1254',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  server: {
    host: true,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",          // unsafe-inline needed for Vite HMR in dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",          // https: allows any HTTPS image (gif CDNs)
        [
          "connect-src 'self'",
          "https://*.supabase.co",
          "wss://*.supabase.co",
          'https://exercisedb.p.rapidapi.com',
          'https://*.sentry.io',
          'https://o4511190448209920.ingest.us.sentry.io',
          // Allow local Supabase for dev (e.g. http://127.0.0.1:54321) and its WS endpoint.
          ...(supabaseOrigin ? [supabaseOrigin] : []),
          ...(supabaseHost ? [`ws://${supabaseHost}`, `wss://${supabaseHost}`] : []),
          // Extra coverage for dev environments that use `localhost` vs `127.0.0.1`
          // or may vary the port.
          'http://127.0.0.1:*',
          'http://localhost:*',
          'ws://127.0.0.1:*',
          'ws://localhost:*',
          'wss://127.0.0.1:*',
          'wss://localhost:*',
        ].join(' '),
        "frame-ancestors 'none'",                     // anti-clickjacking
      ].join('; '),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
})
