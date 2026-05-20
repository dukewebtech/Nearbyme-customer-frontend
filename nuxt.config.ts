export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vite-pwa/nuxt'],

  devtools: { enabled: process.env.NODE_ENV === 'development' },

  devServer: { port: 3002 },

  nitro: { preset: 'vercel' },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || '',
      paystackKey: process.env.NUXT_PUBLIC_PAYSTACK_KEY || ''
    }
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
      ],
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'NearbyMe' },
        { name: 'theme-color', content: '#E85D2F' },
      ],
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'NearbyMe',
      short_name: 'NearbyMe',
      description: 'Order food, pharmacy and more near you',
      theme_color: '#E85D2F',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        { src: 'pwa-64x64.png',            sizes: '64x64',   type: 'image/png' },
        { src: 'pwa-192x192.png',           sizes: '192x192', type: 'image/png' },
        { src: 'pwa-512x512.png',           sizes: '512x512', type: 'image/png' },
        { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
          handler: 'NetworkFirst',
          options: { cacheName: 'supabase-cache', expiration: { maxEntries: 50 } },
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
  },

  compatibilityDate: '2025-01-15'
})
