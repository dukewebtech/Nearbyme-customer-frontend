export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@pinia/nuxt'],

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

  compatibilityDate: '2025-01-15'
})
