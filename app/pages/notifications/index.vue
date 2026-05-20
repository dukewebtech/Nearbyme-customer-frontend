<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-semibold text-[#191919]">Notifications</h1>
        <span v-if="unreadCount" class="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
          {{ unreadCount > 9 ? '9+' : unreadCount }}
        </span>
      </div>
      <button v-if="notifications.length" class="text-xs font-semibold text-brand-500" @click="markAll">
        Mark all read
      </button>
    </div>

    <div v-if="pending" class="px-4 pt-4 space-y-2">
      <USkeleton v-for="i in 5" :key="i" class="h-20 rounded-2xl" />
    </div>

    <template v-else-if="notifications.length">
      <!-- Today group -->
      <div v-if="todayGroup.length" class="px-4 pt-4">
        <p class="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-2">Today</p>
        <div class="space-y-2">
          <button
            v-for="n in todayGroup"
            :key="n.id"
            class="w-full bg-white rounded-2xl p-4 flex items-start gap-3 text-left transition-opacity"
            :class="{ 'opacity-60': n.is_read || n.read }"
            @click="tapNotif(n)"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="notifStyle(n).bg">
              <span class="text-lg">{{ notifStyle(n).emoji }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[#1e1e1e]">{{ n.title }}</p>
              <p class="text-xs text-[#969696] mt-0.5 leading-relaxed">{{ n.body ?? n.message }}</p>
              <p class="text-[10px] text-[#bdbdbd] mt-1">{{ timeAgo(n.created_at) }}</p>
            </div>
            <div v-if="!(n.is_read || n.read)" class="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
          </button>
        </div>
      </div>

      <!-- This Week group -->
      <div v-if="weekGroup.length" class="px-4 pt-4">
        <p class="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-2">This Week</p>
        <div class="space-y-2">
          <button
            v-for="n in weekGroup"
            :key="n.id"
            class="w-full bg-white rounded-2xl p-4 flex items-start gap-3 text-left transition-opacity"
            :class="{ 'opacity-60': n.is_read || n.read }"
            @click="tapNotif(n)"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" :class="notifStyle(n).bg">
              <span class="text-lg">{{ notifStyle(n).emoji }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[#1e1e1e]">{{ n.title }}</p>
              <p class="text-xs text-[#969696] mt-0.5 leading-relaxed">{{ n.body ?? n.message }}</p>
              <p class="text-[10px] text-[#bdbdbd] mt-1">{{ timeAgo(n.created_at) }}</p>
            </div>
            <div v-if="!(n.is_read || n.read)" class="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
          </button>
        </div>
      </div>
    </template>

    <!-- Empty -->
    <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[#fce7e3] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-bell" class="w-10 h-10 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">It's Quiet in Here...</p>
      <p class="text-sm text-[#969696] mt-1 max-w-[240px]">Place your first order to start receiving real-time updates, deals, and delivery alerts.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()

const { data, pending, refresh } = await useAsyncData('notifications', () => api.getNotifications() as any, { server: false })
const notifications = computed<any[]>(() => (data.value as any)?.data ?? [])
const unreadCount   = computed(() => notifications.value.filter(n => !(n.is_read || n.read)).length)

const now = new Date()
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
const weekStart  = todayStart - 6 * 86400000

const todayGroup = computed(() => notifications.value.filter(n => new Date(n.created_at ?? Date.now()).getTime() >= todayStart))
const weekGroup  = computed(() => notifications.value.filter(n => { const t = new Date(n.created_at ?? Date.now()).getTime(); return t < todayStart && t >= weekStart }))

function notifStyle(n: any) {
  const type = (n.type ?? n.title ?? '').toLowerCase()
  if (type.includes('deliver') || type.includes('confirm')) return { bg: 'bg-green-50', emoji: '✅' }
  if (type.includes('pickup') || type.includes('ready'))    return { bg: 'bg-blue-50',  emoji: '🛍' }
  if (type.includes('payment'))  return { bg: 'bg-purple-50', emoji: '💰' }
  if (type.includes('offer') || type.includes('deal') || type.includes('free')) return { bg: 'bg-amber-50', emoji: '🛵' }
  if (type.includes('rate') || type.includes('review'))     return { bg: 'bg-yellow-50', emoji: '⭐' }
  if (type.includes('restaurant') || type.includes('new'))  return { bg: 'bg-teal-50',   emoji: '🏪' }
  if (type.includes('rider') || type.includes('way'))       return { bg: 'bg-[#fdefec]', emoji: '🚴' }
  return { bg: 'bg-[#fdefec]', emoji: '🔔' }
}

function timeAgo(iso: string): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins} min${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

async function tapNotif(n: any) {
  if (!(n.is_read || n.read)) {
    try { await api.markNotificationRead(n.id) } catch { /* ok */ }
    n.is_read = true
  }
  if (n.order_id) navigateTo(`/orders/${n.order_id}`)
}

async function markAll() {
  try {
    await api.markNotificationRead('all')
    await refresh()
  } catch {
    notifications.value.forEach((n: any) => { n.is_read = true; n.read = true })
  }
}

useSeoMeta({ title: 'Notifications — NearbyMe' })
</script>
