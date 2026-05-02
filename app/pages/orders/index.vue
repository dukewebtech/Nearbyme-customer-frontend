<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4">
      <h1 class="text-2xl font-semibold text-[#1e1e1e] mb-4">Orders</h1>

      <!-- Tabs -->
      <div class="flex bg-[#f0f0f0] rounded-full p-1 w-fit gap-1">
        <button
          v-for="tab in tabs"
          :key="tab"
          class="px-5 py-2 rounded-full text-sm font-medium transition-colors"
          :class="activeTab === tab ? 'bg-brand-500 text-white' : 'text-[#1e1e1e]'"
          @click="activeTab = tab"
        >{{ tab }}</button>
      </div>
    </div>

    <div class="px-4 pt-4">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-2xl" />
      </div>

      <div v-else-if="filteredOrders.length" class="space-y-3">
        <NuxtLink
          v-for="order in filteredOrders"
          :key="order.id"
          :to="`/orders/${order.id}`"
          class="block bg-white rounded-2xl p-4"
        >
          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <p class="text-base font-semibold text-[#1e1e1e]">{{ orderRestaurantName(order) }}</p>
              <p class="text-xs text-brand-500 font-medium mt-0.5">{{ orderItemCount(order) }} item{{ orderItemCount(order) !== 1 ? 's' : '' }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-[#1e1e1e]">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</p>
              <OrderStatusBadge :status="order.status" class="mt-1" />
            </div>
          </div>
          <div class="flex items-center justify-between border-t border-gray-50 pt-3">
            <div class="flex items-center gap-1.5 text-xs text-[#969696]">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5" />
              {{ order.average_prep_time ?? '25-30' }} mins
            </div>
            <div class="flex items-center gap-1.5 text-xs text-[#969696]">
              <UIcon name="i-lucide-bike" class="w-3.5 h-3.5" />
              ₦{{ Number(order.delivery_fee ?? 500).toLocaleString('en-NG') }}
            </div>
            <span
              v-if="isPending(order)"
              class="text-xs font-semibold text-[#ec2020] bg-[#ffe6e6] px-2.5 py-1 rounded-full"
            >Unpaid</span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="bg-white rounded-2xl py-16 flex flex-col items-center text-center">
        <UIcon name="i-lucide-shopping-bag" class="w-12 h-12 text-gray-300 mb-3" />
        <p class="text-base font-semibold text-[#191919]">No {{ activeTab }} Orders</p>
        <p class="text-sm text-[#969696] mt-1 mb-6">Your {{ activeTab.toLowerCase() }} orders will appear here</p>
        <NuxtLink to="/" class="bg-brand-500 text-white text-sm font-semibold px-8 py-3 rounded-full">
          Explore Categories
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const tabs = ['Pending', 'Ongoing', 'Completed']
const activeTab = ref('Pending')

const { data, pending } = await useAsyncData('my-orders', () => api.getOrders() as any, { server: false })
const orders = computed<any[]>(() => (data.value as any)?.data ?? [])

const PENDING_STATUSES = ['placed', 'pending']
const ONGOING_STATUSES = ['accepted', 'preparing', 'ready', 'picked_up']
const COMPLETED_STATUSES = ['delivered', 'cancelled']

const filteredOrders = computed(() => {
  const map: Record<string, string[]> = { Pending: PENDING_STATUSES, Ongoing: ONGOING_STATUSES, Completed: COMPLETED_STATUSES }
  return orders.value.filter(o => map[activeTab.value]?.includes(o.status))
})

function isPending(o: any) { return PENDING_STATUSES.includes(o.status) }
function orderRestaurantName(o: any) { return o.restaurants?.name ?? 'Restaurant' }
function orderItemCount(o: any) { return o.order_items?.length ?? 0 }

useSeoMeta({ title: 'Orders — NearbyMe' })
</script>
