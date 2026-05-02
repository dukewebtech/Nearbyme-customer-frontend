import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabase() {
  if (!_supabase) {
    const config = useRuntimeConfig()
    _supabase = createClient(config.public.supabaseUrl, config.public.supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, storageKey: 'nearbyMe-customer-auth' }
    })
  }
  return _supabase
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const session = ref<any>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!session.value?.access_token)
  const accessToken = computed(() => session.value?.access_token ?? null)

  async function init() {
    if (initialized.value) return
    const supabase = getSupabase()
    const { data } = await supabase.auth.getSession()
    if (data.session) {
      session.value = data.session
      user.value = data.session.user
    }
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
    initialized.value = true
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const res = await $fetch<any>(`${config.public.apiBase}/auth/login`, {
        method: 'POST',
        body: { email, password }
      })
      if (!res.success) throw new Error(res.message ?? 'Login failed')
      session.value = { access_token: res.data.access_token, refresh_token: res.data.refresh_token }
      user.value = res.data.user
      await getSupabase().auth.setSession({
        access_token: res.data.access_token,
        refresh_token: res.data.refresh_token
      })
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function signup(email: string, password: string, firstName: string, lastName: string, phone?: string) {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const res = await $fetch<any>(`${config.public.apiBase}/auth/signup`, {
        method: 'POST',
        body: { email, password, first_name: firstName, last_name: lastName, role: 'customer', phone }
      })
      if (!res.success) throw new Error(res.message ?? 'Signup failed')
      if (res.data.access_token) {
        session.value = { access_token: res.data.access_token, refresh_token: res.data.refresh_token }
        user.value = res.data.user
        await getSupabase().auth.setSession({
          access_token: res.data.access_token,
          refresh_token: res.data.refresh_token
        })
      }
      return res.data
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await getSupabase().auth.signOut()
    session.value = null
    user.value = null
  }

  return { user, session, loading, initialized, isLoggedIn, accessToken, init, login, signup, logout }
})
