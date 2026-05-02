<template>
  <div class="pb-[72px] min-h-screen bg-white">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4 flex items-center gap-3 border-b border-gray-50">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <div>
        <h1 class="text-base font-semibold text-[#1e1e1e]">Track Order</h1>
        <p class="text-xs text-[#969696]">#{{ orderId.slice(-8).toUpperCase() }}</p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
    </div>

    <template v-else-if="order">
      <div class="px-4 pt-4 space-y-4">
        <!-- Status banner -->
        <div class="bg-[#fdefec] rounded-2xl p-4">
          <p class="text-base font-semibold text-[#1e1e1e] mb-0.5">{{ statusMessage }}</p>
          <p class="text-sm text-[#585858]">Estimated delivery time is {{ order.restaurants?.average_prep_time_minutes ?? 30 }}-{{ (order.restaurants?.average_prep_time_minutes ?? 30) + 10 }} mins</p>
        </div>

        <!-- Progress steps -->
        <div class="flex items-center justify-between px-2">
          <div
            v-for="(step, i) in steps"
            :key="step.key"
            class="flex flex-col items-center gap-1.5 flex-1"
          >
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              :class="isStepDone(step.key) ? 'bg-brand-500' : 'bg-[#f0f0f0]'"
            >
              <UIcon :name="step.icon" class="w-4 h-4" :class="isStepDone(step.key) ? 'text-white' : 'text-[#969696]'" />
            </div>
            <p class="text-[10px] text-center" :class="isStepDone(step.key) ? 'text-brand-500 font-medium' : 'text-[#585858]'">
              {{ step.label }}
            </p>
            <!-- connector -->
            <div v-if="i < steps.length - 1" class="hidden" />
          </div>
          <!-- connector lines -->
        </div>

        <!-- Rider info (if assigned) -->
        <div v-if="order.rider_id" class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-[#f5e9e7] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-user-round" class="w-6 h-6 text-brand-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-[#1e1e1e]">{{ riderName }}</p>
            <p class="text-xs text-[#969696]">Your delivery rider</p>
          </div>
          <div class="flex gap-2">
            <button class="w-9 h-9 rounded-full bg-[#fdefec] flex items-center justify-center">
              <UIcon name="i-lucide-phone" class="w-4 h-4 text-brand-500" />
            </button>
            <button class="w-9 h-9 rounded-full bg-[#fdefec] flex items-center justify-center">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4 text-brand-500" />
            </button>
          </div>
        </div>

        <div v-else class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#f0f0f0] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-bike" class="w-5 h-5 text-[#969696]" />
          </div>
          <p class="text-sm text-[#585858]">Searching for rider...</p>
        </div>

        <!-- Order items -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4">
          <p class="text-xs font-medium text-[#969696] mb-3">ORDER ITEMS</p>
          <div class="space-y-2">
            <div v-for="item in orderItems" :key="item.id" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg">🍛</span>
                <div>
                  <p class="text-sm text-[#1e1e1e] font-medium">{{ item.name }}</p>
                  <p class="text-xs text-[#969696]">x{{ item.quantity }}</p>
                </div>
              </div>
              <p class="text-sm font-semibold text-[#1e1e1e]">₦{{ (item.unitPrice * item.quantity).toLocaleString('en-NG') }}</p>
            </div>
          </div>
          <div class="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span class="text-sm font-semibold text-[#1e1e1e]">Total</span>
            <span class="text-sm font-bold text-brand-500">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="px-4 pt-10 text-center text-[#969696]">
      <p>Order not found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const orderId = route.params.id as string

const { data, pending } = await useAsyncData(`order-${orderId}`, () => api.getOrder(orderId) as any, { server: false })
const order = computed(() => (data.value as any)?.data)

const STEP_ORDER = ['placed', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered']

const steps = [
  { key: 'placed',     label: 'Order Placed',  icon: 'i-lucide-clipboard-list' },
  { key: 'preparing',  label: 'In Store',       icon: 'i-lucide-chef-hat' },
  { key: 'picked_up',  label: 'On the way',     icon: 'i-lucide-bike' },
  { key: 'delivered',  label: 'Arrived',        icon: 'i-lucide-house' },
]

function isStepDone(key: string) {
  const current = order.value?.status
  const currentIdx = STEP_ORDER.indexOf(current)
  const stepIdx = STEP_ORDER.indexOf(key)
  return stepIdx <= currentIdx
}

const statusMessage = computed(() => {
  const map: Record<string, string> = {
    placed:    'Order received! Getting ready.',
    accepted:  'Restaurant accepted your order.',
    preparing: 'Your order is being prepared.',
    ready:     'Order ready for pickup.',
    picked_up: 'Hold tight! Your order is on its way.',
    delivered: 'Your order has been delivered!',
    cancelled: 'This order was cancelled.',
  }
  return map[order.value?.status] ?? 'Tracking your order...'
})

const riderName = computed(() => {
  const r = order.value?.riders
  if (!r) return 'Rider'
  const u = r.users
  return u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'Rider' : 'Rider'
})

const orderItems = computed(() => {
  return (order.value?.order_items ?? []).map((i: any) => ({
    id: i.id,
    name: i.menu_items?.name ?? 'Item',
    quantity: i.quantity,
    unitPrice: Number(i.unit_price ?? 0),
  }))
})

useSeoMeta({ title: 'Track Order — NearbyMe' })
</script>
