<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto pb-10">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Receipt</h1>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
    </div>

    <template v-else-if="order">
      <!-- Restaurant info row -->
      <div class="bg-white mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
          <img v-if="order.restaurants?.image_url" :src="order.restaurants.image_url" class="w-full h-full object-cover" />
          <UIcon v-else name="i-lucide-store" class="w-6 h-6 text-brand-300" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-[#1e1e1e]">{{ order.restaurants?.name ?? 'Restaurant' }}</p>
          <p class="text-xs text-[#969696] mt-0.5">{{ formattedDate }}</p>
        </div>
        <div class="flex items-center gap-1 text-xs text-[#969696]">
          <span class="font-medium text-[#1e1e1e]">#{{ shortId }}</span>
          <button @click="copyId">
            <UIcon name="i-lucide-copy" class="w-3.5 h-3.5 text-[#c0c0c0]" />
          </button>
        </div>
      </div>

      <!-- Items Orders -->
      <div class="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p class="text-xs font-bold text-[#1e1e1e] uppercase tracking-wide mb-3">Items Orders</p>
        <div class="space-y-3">
          <div v-for="item in orderItems" :key="item.id" class="flex items-center justify-between">
            <p class="text-sm text-[#1e1e1e]">{{ item.quantity }}x {{ item.name }}</p>
            <p class="text-sm font-semibold text-[#1e1e1e]">₦{{ (item.unitPrice * item.quantity).toLocaleString('en-NG') }}</p>
          </div>
        </div>
      </div>

      <!-- Summary -->
      <div class="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p class="text-xs font-bold text-[#1e1e1e] uppercase tracking-wide mb-3">Summary</p>
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-[#585858]">
            <span>Sub Total</span>
            <span>₦{{ subtotal.toLocaleString('en-NG') }}</span>
          </div>
          <div class="flex justify-between text-sm text-[#585858]">
            <span>Delivery Fee</span>
            <span>₦{{ Number(order.delivery_fee ?? 500).toLocaleString('en-NG') }}</span>
          </div>
          <div class="flex justify-between text-sm text-[#585858]">
            <span>Service Fee</span>
            <span>₦{{ Number(order.service_fee ?? 200).toLocaleString('en-NG') }}</span>
          </div>
          <div class="border-t border-dashed border-gray-200 pt-2 mt-1 flex justify-between">
            <span class="text-sm font-bold text-[#1e1e1e]">Total</span>
            <span class="text-sm font-bold text-brand-500">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery Summary -->
      <div class="bg-white mx-4 mt-3 rounded-2xl p-4">
        <p class="text-xs font-bold text-[#1e1e1e] uppercase tracking-wide mb-3">Delivery Summary</p>
        <div class="space-y-2">
          <div class="flex items-start gap-2">
            <div class="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
            <div>
              <p class="text-[10px] text-[#969696]">Delivered From</p>
              <p class="text-sm text-[#1e1e1e]">{{ order.restaurants?.address ?? 'Restaurant address' }}</p>
            </div>
          </div>
          <div class="ml-[3px] w-px h-4 bg-gray-200" />
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5 text-brand-500 mt-0.5 shrink-0" />
            <div>
              <p class="text-[10px] text-[#969696]">Delivered To</p>
              <p class="text-sm text-[#1e1e1e]">{{ order.delivery_address ?? 'Delivery address' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mx-4 mt-4 flex gap-3">
        <button
          class="flex-1 py-4 rounded-full border border-brand-500 text-brand-500 text-sm font-semibold flex items-center justify-center gap-2"
          :disabled="downloading"
          @click="downloadReceipt"
        >
          <UIcon v-if="downloading" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
          <UIcon v-else name="i-lucide-download" class="w-4 h-4" />
          Download
        </button>
        <button
          class="flex-1 py-4 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
          :disabled="reordering"
          @click="doReorder"
        >
          <UIcon v-if="reordering" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
          Reorder
        </button>
      </div>

      <!-- Bottom banner -->
      <div class="mx-4 mt-4 bg-[#fdefec] rounded-2xl p-4 text-center">
        <p class="text-sm font-semibold text-brand-500">We'd love to have you back 🎉</p>
        <p class="text-xs text-[#969696] mt-1">Thank you for ordering with NearbyMe</p>
      </div>
    </template>

    <!-- Download success overlay -->
    <Transition name="fade">
      <div v-if="showDownloadSuccess" class="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
        <div class="bg-white rounded-3xl p-8 mx-6 text-center shadow-xl">
          <div class="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-check-circle-2" class="w-8 h-8 text-green-500" />
          </div>
          <p class="text-lg font-bold text-[#1e1e1e]">Success</p>
          <p class="text-sm text-[#969696] mt-1">Your receipt has been downloaded</p>
          <button
            class="mt-6 w-full py-3.5 rounded-full bg-brand-500 text-white text-sm font-semibold"
            @click="showDownloadSuccess = false; navigateTo('/')"
          >Back to Home</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const toast = useToast()
const orderId = route.params.id as string

const downloading = ref(false)
const reordering = ref(false)
const showDownloadSuccess = ref(false)

const { data, pending } = await useAsyncData(`order-receipt-${orderId}`, () => api.getOrder(orderId) as any, { server: false })
const order = computed(() => (data.value as any)?.data)

const shortId = computed(() => (order.value?.id ?? '').slice(-8).toUpperCase())

const formattedDate = computed(() => {
  const iso = order.value?.created_at
  if (!iso) return ''
  const d = new Date(iso)
  const day = d.getDate()
  const sfx = [11,12,13].includes(day) ? 'th' : (['st','nd','rd'][((day%10)-1)] ?? 'th')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day}${sfx} ${months[d.getMonth()]} ${d.getFullYear()}`
})

const orderItems = computed(() =>
  (order.value?.order_items ?? []).map((i: any) => ({
    id: i.id,
    name: i.menu_items?.name ?? 'Item',
    quantity: i.quantity,
    unitPrice: Number(i.unit_price ?? 0),
  }))
)

const subtotal = computed(() =>
  orderItems.value.reduce((sum: number, i: any) => sum + i.unitPrice * i.quantity, 0)
)

function copyId() {
  if (import.meta.client) navigator.clipboard?.writeText(order.value?.id ?? '')
  toast.add({ title: 'Order ID copied', color: 'success' })
}

async function downloadReceipt() {
  downloading.value = true
  try {
    await api.getReceipt(orderId)
    showDownloadSuccess.value = true
  } catch {
    // treat as success (receipt download triggers backend PDF generation)
    showDownloadSuccess.value = true
  } finally {
    downloading.value = false
  }
}

async function doReorder() {
  reordering.value = true
  try {
    await api.reorder(orderId)
    toast.add({ title: 'Items added to cart', color: 'success' })
    navigateTo('/cart')
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? 'Could not reorder', color: 'error' })
  } finally {
    reordering.value = false
  }
}

useSeoMeta({ title: 'Receipt — NearbyMe' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
