<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4">
      <div class="flex items-center justify-between mb-4">
        <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
          <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
        </button>
        <h1 class="text-lg font-semibold text-[#1e1e1e]">Orders</h1>
        <div class="w-9" />
      </div>

      <!-- Tabs -->
      <div class="flex bg-[#f0f0f0] rounded-full p-1 gap-1">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="flex-1 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="activeTab === tab ? 'bg-brand-500 text-white' : 'text-[#1e1e1e]'"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>
    </div>

    <div class="px-4 pt-4">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-28 rounded-2xl" />
      </div>

      <!-- PENDING TAB -->
      <template v-else-if="activeTab === 'Pending'">
        <div v-if="pendingOrders.length">
          <p class="text-sm font-semibold text-[#1e1e1e] mb-3">Continue with payment</p>
          <div class="space-y-3">
            <div
              v-for="order in pendingOrders"
              :key="order.id"
              class="bg-white rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="w-16 h-16 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
                <img v-if="order.restaurants?.image_url" :src="order.restaurants.image_url" class="w-full h-full object-cover" />
                <UIcon v-else name="i-lucide-store" class="w-7 h-7 text-brand-300" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ order.restaurants?.name ?? 'Restaurant' }}</p>
                  <span class="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full shrink-0">Unpaid</span>
                </div>
                <p class="text-sm font-bold text-[#1e1e1e] mt-0.5">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</p>
                <div class="flex items-center gap-3 mt-1 text-[10px] text-[#969696]">
                  <span>{{ order.order_items?.length ?? 0 }} item{{ order.order_items?.length !== 1 ? 's' : '' }}</span>
                  <span class="flex items-center gap-0.5">
                    <UIcon name="i-lucide-clock" class="w-3 h-3" />
                    {{ order.restaurants?.average_prep_time_minutes ?? 30 }}-{{ (order.restaurants?.average_prep_time_minutes ?? 30) + 10 }} mins
                  </span>
                  <span class="flex items-center gap-0.5">
                    <UIcon name="i-lucide-bike" class="w-3 h-3" />
                    ₦{{ Number(order.delivery_fee ?? 500).toLocaleString('en-NG') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <EmptyOrders v-else label="Pending" />
      </template>

      <!-- ONGOING TAB -->
      <template v-else-if="activeTab === 'Ongoing'">
        <div v-if="ongoingOrders.length">
          <p class="text-sm font-semibold text-[#1e1e1e] mb-3">Track Your Order</p>
          <div class="space-y-3">
            <div
              v-for="order in ongoingOrders"
              :key="order.id"
              class="bg-white rounded-2xl p-4 flex items-center gap-3"
            >
              <div class="w-16 h-16 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
                <img v-if="order.restaurants?.image_url" :src="order.restaurants.image_url" class="w-full h-full object-cover" />
                <UIcon v-else name="i-lucide-store" class="w-7 h-7 text-brand-300" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ order.restaurants?.name ?? 'Restaurant' }}</p>
                  <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">On the way</span>
                </div>
                <p class="text-sm font-bold text-[#1e1e1e] mt-0.5">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-[10px] text-[#969696]">{{ order.order_items?.length ?? 0 }} items · {{ order.restaurants?.average_prep_time_minutes ?? 30 }} mins</span>
                  <NuxtLink
                    :to="`/orders/${order.id}`"
                    class="text-[11px] font-semibold text-brand-500 bg-brand-50 px-3 py-1 rounded-full"
                  >Track Order</NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
        <EmptyOrders v-else label="Ongoing" />
      </template>

      <!-- COMPLETED TAB -->
      <template v-else>
        <div v-if="completedOrders.length">
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm font-semibold text-[#1e1e1e]">All Completed Orders</p>
          </div>
          <div v-for="(group, date) in groupedCompleted" :key="date" class="mb-4">
            <p class="text-xs font-semibold text-[#969696] mb-2">{{ date }}</p>
            <div class="space-y-3">
              <div
                v-for="order in group"
                :key="order.id"
                class="bg-white rounded-2xl p-4 flex items-center gap-3"
              >
                <div class="w-16 h-16 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
                  <img v-if="order.restaurants?.image_url" :src="order.restaurants.image_url" class="w-full h-full object-cover" />
                  <UIcon v-else name="i-lucide-store" class="w-7 h-7 text-brand-300" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ order.restaurants?.name ?? 'Restaurant' }}</p>
                  <p class="text-[11px] text-[#969696] mt-0.5 truncate">{{ orderItemSummary(order) }}</p>
                  <div class="flex items-center justify-between mt-1.5">
                    <div class="flex items-center gap-2">
                      <p class="text-sm font-bold text-[#1e1e1e]">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</p>
                      <span class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Delivered</span>
                    </div>
                    <button
                      class="text-[11px] font-semibold text-brand-500 bg-brand-50 px-3 py-1 rounded-full"
                      @click="doReorder(order.id)"
                    >Reorder</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <EmptyOrders v-else label="Completed" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const toast = useToast()
const tabs = ['Pending', 'Ongoing', 'Completed'] as const
const activeTab = ref<'Pending' | 'Ongoing' | 'Completed'>('Pending')

const { data, pending, refresh } = await useAsyncData('my-orders', () => api.getOrders() as any, { server: false })
const orders = computed<any[]>(() => (data.value as any)?.data ?? [])

const pendingOrders   = computed(() => orders.value.filter(o => ['placed', 'pending'].includes(o.status)))
const ongoingOrders   = computed(() => orders.value.filter(o => ['accepted', 'preparing', 'ready', 'picked_up'].includes(o.status)))
const completedOrders = computed(() => orders.value.filter(o => ['delivered', 'cancelled'].includes(o.status)))

const groupedCompleted = computed(() => {
  const groups: Record<string, any[]> = {}
  completedOrders.value.forEach(o => {
    const label = formatDate(o.created_at)
    if (!groups[label]) groups[label] = []
    groups[label].push(o)
  })
  return groups
})

function formatDate(iso: string): string {
  if (!iso) return 'Earlier'
  const d = new Date(iso)
  const today = new Date()
  const day = d.getDate()
  const sfx = [11,12,13].includes(day) ? 'th' : ['st','nd','rd'][((day%10)-1)] ?? 'th'
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const label = `${day}${sfx} ${months[d.getMonth()]} ${d.getFullYear()}`
  return d.toDateString() === today.toDateString() ? `Today — ${label}` : label
}

function orderItemSummary(o: any): string {
  const items = o.order_items ?? []
  if (!items.length) return ''
  const first = items[0]?.menu_items?.name ?? 'Item'
  return items.length > 1 ? `1x ${first} + ${items.length - 1} more item` : `1x ${first}`
}

async function doReorder(id: string) {
  try {
    await api.reorder(id)
    toast.add({ title: 'Items added to cart', color: 'success' })
    navigateTo('/cart')
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? 'Could not reorder', color: 'error' })
  }
}

useSeoMeta({ title: 'Orders — NearbyMe' })
</script>

<!-- Inline empty-state helper so no extra file needed -->
<script lang="ts">
import { defineComponent, h } from 'vue'

const EmptyOrders = defineComponent({
  props: { label: String },
  setup(props) {
    return () => h('div', { class: 'bg-white rounded-2xl py-16 flex flex-col items-center text-center' }, [
      h('div', { class: 'w-16 h-16 rounded-full bg-[#fce7e3] flex items-center justify-center mb-3' },
        h('span', { class: 'text-3xl' }, '🛒')
      ),
      h('p', { class: 'text-base font-semibold text-[#191919]' }, `No ${props.label} Orders`),
      h('p', { class: 'text-sm text-[#969696] mt-1 mb-6' }, `Your ${(props.label ?? '').toLowerCase()} orders will appear here`),
      h('a', { href: '/', class: 'bg-brand-500 text-white text-sm font-semibold px-8 py-3 rounded-full' }, 'Order Now'),
    ])
  }
})
export default {}
</script>
