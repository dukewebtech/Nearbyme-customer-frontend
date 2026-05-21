import { createClient } from '@supabase/supabase-js'

export function useNotifications() {
  const api       = useApi()
  const authStore = useAuthStore()

  const notifications = ref<any[]>([])
  const unreadCount   = ref(0)
  const pending       = ref(true)

  async function load() {
    pending.value = true
    try {
      const res = await api.getNotifications() as any
      notifications.value = res?.data ?? []
      unreadCount.value   = res?.unread_count ?? 0
    } finally {
      pending.value = false
    }
  }

  async function markRead(id: string) {
    try {
      await api.markNotificationRead(id)
    } catch { /* ok */ }

    if (id === 'all') {
      notifications.value.forEach((n: any) => { n.is_read = true })
      unreadCount.value = 0
    } else {
      const n = notifications.value.find((n: any) => n.id === id)
      if (n) n.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null

  onMounted(async () => {
    await load()

    const userId      = authStore.user?.id
    const accessToken = authStore.accessToken
    const config      = useRuntimeConfig()

    if (!userId || !accessToken || !config.public.supabaseUrl) return

    const supabase = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
      { auth: { persistSession: false } },
    )

    // Authenticate the realtime connection with the user's current token
    await supabase.auth.setSession({
      access_token:  accessToken,
      refresh_token: (authStore.session as any)?.refresh_token ?? '',
    })

    channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes' as any,
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: any) => {
          notifications.value.unshift(payload.new)
          unreadCount.value++
        },
      )
      .subscribe()
  })

  onUnmounted(() => {
    channel?.unsubscribe()
    channel = null
  })

  return { notifications, unreadCount, pending, markRead, refresh: load }
}
