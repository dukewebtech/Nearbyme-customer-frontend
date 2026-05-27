<template>
  <div class="min-h-screen bg-white max-w-[390px] mx-auto flex flex-col">
    <!-- Full-screen map -->
    <div class="relative h-[52vh] bg-[#e8f0fe]">
      <iframe
        class="w-full h-full border-0"
        :src="mapSrc"
        loading="lazy"
        title="Order tracking map"
      />
      <!-- Back button -->
      <button
        class="absolute top-12 left-4 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center z-10"
        @click="$router.back()"
      >
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <!-- Actions -->
      <div class="absolute top-12 right-4 flex gap-2 z-10">
        <NuxtLink :to="`/orders/${orderId}/receipt`" class="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center">
          <UIcon name="i-lucide-receipt" class="w-4 h-4 text-[#1e1e1e]" />
        </NuxtLink>
        <button class="w-9 h-9 rounded-full bg-white shadow flex items-center justify-center" @click="refresh">
          <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 text-[#1e1e1e]" />
        </button>
      </div>

      <!-- "Rider has arrived" banner -->
      <Transition name="slide-down">
        <div
          v-if="order?.status === 'picked_up' && !confirmOpen"
          class="absolute top-24 left-4 right-4 bg-[#1e1e1e] rounded-2xl px-4 py-3 flex items-center justify-between z-10"
        >
          <div>
            <p class="text-sm font-semibold text-white">{{ riderName }} picked up your order and is on the way!</p>
            <p class="text-xs text-white/70 mt-0.5">Your order is heading to you now</p>
          </div>
          <button class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" @click="confirmOpen = true">
            <UIcon name="i-lucide-x" class="w-4 h-4 text-white" />
          </button>
        </div>
      </Transition>

      <!-- Delivery code banner -->
      <Transition name="slide-down">
        <div
          v-if="order?.delivery_code && !confirmOpen"
          class="absolute top-[7.5rem] left-4 right-4 bg-white rounded-2xl px-4 py-3 shadow-lg z-10"
        >
          <p class="text-xs text-[#969696]">Your order code is</p>
          <p class="text-2xl font-bold text-brand-500 tracking-[0.3em] mt-0.5">{{ order.delivery_code }}</p>
          <p class="text-xs text-[#969696] mt-0.5">You'll need this code to receive your order</p>
        </div>
      </Transition>
    </div>

    <!-- Bottom panel -->
    <div class="flex-1 flex flex-col px-4 pt-4 pb-[72px]">
      <div v-if="pending" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
      </div>

      <template v-else-if="order">
        <!-- Status -->
        <div class="bg-[#fdefec] rounded-2xl p-4 mb-4">
          <p class="text-base font-bold text-[#1e1e1e]">{{ statusMessage }}</p>
          <p class="text-sm text-[#585858] mt-0.5">
            Estimated delivery time is {{ order.restaurants?.average_prep_time_minutes ?? 30 }}-{{ (order.restaurants?.average_prep_time_minutes ?? 30) + 10 }} mins
          </p>
        </div>

        <!-- Progress steps -->
        <div class="flex items-center mb-4 px-2">
          <div v-for="(step, i) in steps" :key="step.key" class="flex items-center flex-1">
            <div class="flex flex-col items-center gap-1">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                :class="isStepDone(step.key) ? 'bg-brand-500' : 'bg-[#f0f0f0]'"
              >
                <UIcon :name="step.icon" class="w-5 h-5" :class="isStepDone(step.key) ? 'text-white' : 'text-[#969696]'" />
              </div>
              <p class="text-[9px] text-center font-medium" :class="isStepDone(step.key) ? 'text-brand-500' : 'text-[#969696]'">
                {{ step.label }}
              </p>
            </div>
            <div v-if="i < steps.length - 1" class="flex-1 h-px mx-1 transition-colors" :class="isStepDone(steps[i+1].key) ? 'bg-brand-500' : 'bg-[#e0e0e0]'" />
          </div>
        </div>

        <!-- Rider card -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 mb-4 shadow-sm">
          <div class="w-12 h-12 rounded-full bg-[#f5e9e7] flex items-center justify-center shrink-0 overflow-hidden">
            <UIcon name="i-lucide-user-round" class="w-6 h-6 text-brand-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1e1e1e]">{{ riderName }}</p>
            <div class="flex items-center gap-1 mt-0.5">
              <UIcon name="i-lucide-star" class="w-3 h-3 text-[#f8cc6b] fill-[#f8cc6b]" />
              <span class="text-xs text-[#969696]">{{ riderRating }}</span>
              <span class="text-xs text-[#c0c0c0] mx-1">·</span>
              <span class="text-xs text-[#969696]">Order ID: {{ shortId }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <NuxtLink :to="`/messages`" class="w-9 h-9 rounded-full bg-[#fdefec] flex items-center justify-center">
              <UIcon name="i-lucide-message-circle" class="w-4 h-4 text-brand-500" />
            </NuxtLink>
            <a :href="`tel:${riderPhone}`" class="w-9 h-9 rounded-full bg-[#fdefec] flex items-center justify-center">
              <UIcon name="i-lucide-phone" class="w-4 h-4 text-brand-500" />
            </a>
          </div>
        </div>

        <!-- Order items summary -->
        <div class="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p class="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-3">Order Items</p>
          <div class="space-y-2">
            <div v-for="item in orderItems" :key="item.id" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-base">🍛</span>
                <div>
                  <p class="text-sm font-medium text-[#1e1e1e]">{{ item.name }}</p>
                  <p class="text-xs text-[#969696]">×{{ item.quantity }}</p>
                </div>
              </div>
              <p class="text-sm font-semibold">₦{{ (item.unitPrice * item.quantity).toLocaleString('en-NG') }}</p>
            </div>
          </div>
          <div class="border-t border-gray-100 mt-3 pt-3 flex justify-between">
            <span class="text-sm font-bold text-[#1e1e1e]">Total</span>
            <span class="text-sm font-bold text-brand-500">₦{{ Number(order.total_amount ?? 0).toLocaleString('en-NG') }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Confirm Order modal -->
    <Transition name="fade">
      <div v-if="confirmOpen" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
        <div class="bg-white rounded-t-3xl w-full max-w-[390px] p-6">
          <!-- Item preview -->
          <div class="w-20 h-20 rounded-2xl bg-[#f5e9e7] mx-auto mb-4 overflow-hidden flex items-center justify-center">
            <img v-if="order?.restaurants?.image_url" :src="order?.restaurants?.image_url" class="w-full h-full object-cover" />
            <span v-else class="text-4xl">🍛</span>
          </div>
          <h3 class="text-lg font-bold text-[#1e1e1e] text-center mb-1">Confirm your order</h3>
          <p class="text-sm text-[#969696] text-center mb-5">Please confirm you received the correct items in your order.</p>

          <div class="flex gap-2 mb-4 justify-center">
            <input
              v-for="(_, i) in [0,1,2,3]"
              :key="i"
              v-model="codeDigits[i]"
              type="text"
              maxlength="1"
              inputmode="numeric"
              class="w-14 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors"
              :class="codeDigits[i] ? 'border-brand-500 bg-brand-50 text-brand-500' : 'border-gray-200'"
              @input="onCodeInput($event, i)"
              @keydown.backspace="onCodeBackspace($event, i)"
            />
          </div>

          <button
            class="w-full py-4 rounded-full bg-brand-500 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2 mb-3"
            :disabled="confirming || codeDigits.join('').length < 4"
            @click="submitConfirm"
          >
            <UIcon v-if="confirming" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            Order is Complete
          </button>
          <button class="w-full py-2 text-xs text-[#969696] text-center" @click="confirmOpen = false">Report an issue</button>
        </div>
      </div>
    </Transition>

    <!-- Rating modals (show after confirmed) -->
    <Transition name="fade">
      <div v-if="showRateVendor" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
        <div class="bg-white rounded-t-3xl w-full max-w-[390px] p-6">
          <button class="absolute top-4 right-4 text-[#969696]" @click="showRateVendor = false; showRateRider = true">
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
          <div class="w-20 h-20 rounded-full bg-[#fff3e0] mx-auto mb-3 flex items-center justify-center text-4xl">🍽️</div>
          <p class="text-base font-bold text-[#1e1e1e] text-center">Help us reward great vendors.</p>
          <p class="text-sm text-[#969696] text-center mb-4">Leave a quick rating.</p>
          <p class="text-sm text-[#585858] text-center mb-3">Please select how many stars your experience deserves.</p>
          <div class="flex justify-center gap-2 mb-4">
            <button v-for="s in 5" :key="s" @click="vendorRating = s">
              <UIcon name="i-lucide-star" class="w-8 h-8 transition-colors" :class="s <= vendorRating ? 'text-[#f8cc6b] fill-[#f8cc6b]' : 'text-gray-300'" />
            </button>
          </div>
          <textarea v-model="vendorComment" rows="2" placeholder="Give a detailed review (Optional)" class="w-full text-sm bg-[#f5f5f5] rounded-xl px-3 py-2.5 outline-none resize-none mb-4" />
          <button
            class="w-full py-4 rounded-full bg-brand-500 text-white text-sm font-semibold disabled:opacity-60"
            :disabled="!vendorRating || submittingVendor"
            @click="submitVendorRating"
          >Submit</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="showRateRider" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
        <div class="bg-white rounded-t-3xl w-full max-w-[390px] p-6">
          <button class="absolute top-4 right-4 text-[#969696]" @click="showRateRider = false">
            <UIcon name="i-lucide-x" class="w-5 h-5" />
          </button>
          <div class="w-20 h-20 rounded-full bg-[#fff3e0] mx-auto mb-3 flex items-center justify-center text-4xl">🚴</div>
          <p class="text-base font-bold text-[#1e1e1e] text-center">Help us reward great riders.</p>
          <p class="text-sm text-[#969696] text-center mb-4">Leave a quick rating.</p>
          <p class="text-sm text-[#585858] text-center mb-3">Please select how many stars your experience deserves.</p>
          <div class="flex justify-center gap-2 mb-4">
            <button v-for="s in 5" :key="s" @click="riderRatingVal = s">
              <UIcon name="i-lucide-star" class="w-8 h-8 transition-colors" :class="s <= riderRatingVal ? 'text-[#f8cc6b] fill-[#f8cc6b]' : 'text-gray-300'" />
            </button>
          </div>
          <textarea v-model="riderComment" rows="2" placeholder="Give a detailed review (Optional)" class="w-full text-sm bg-[#f5f5f5] rounded-xl px-3 py-2.5 outline-none resize-none mb-4" />
          <button
            class="w-full py-4 rounded-full bg-brand-500 text-white text-sm font-semibold disabled:opacity-60"
            :disabled="!riderRatingVal || submittingRider"
            @click="submitRiderRating"
          >Next</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route  = useRoute()
const api    = useApi()
const toast  = useToast()
const orderId = route.params.id as string

const confirmOpen = ref(false)
const codeDigits  = ref(['', '', '', ''])
const confirming  = ref(false)

const showRateVendor = ref(false)
const showRateRider  = ref(false)
const vendorRating   = ref(0)
const vendorComment  = ref('')
const riderRatingVal = ref(0)
const riderComment   = ref('')
const submittingVendor = ref(false)
const submittingRider  = ref(false)

const { data, pending, refresh } = await useAsyncData(`order-track-${orderId}`, () => api.getOrder(orderId) as any, { server: false })
const order = computed(() => (data.value as any)?.data)

// Poll every 12s while order is active
let pollTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  pollTimer = setInterval(() => {
    const s = order.value?.status
    if (['accepted','preparing','ready','picked_up'].includes(s)) refresh()
  }, 12000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })

const userLat = import.meta.client ? (localStorage.getItem('userLat') || '6.524') : '6.524'
const userLng = import.meta.client ? (localStorage.getItem('userLng') || '3.379') : '3.379'

const mapSrc = computed(() =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${Number(userLng)-0.04},${Number(userLat)-0.04},${Number(userLng)+0.04},${Number(userLat)+0.04}&layer=mapnik&marker=${userLat},${userLng}`
)

const STEP_ORDER = ['placed','accepted','preparing','ready','picked_up','delivered']
const steps = [
  { key: 'placed',    label: 'In store',    icon: 'i-lucide-store' },
  { key: 'picked_up', label: 'On the way',  icon: 'i-lucide-bike' },
  { key: 'delivered', label: 'Arrived',     icon: 'i-lucide-house' },
]

function isStepDone(key: string) {
  const cur = STEP_ORDER.indexOf(order.value?.status)
  return STEP_ORDER.indexOf(key) <= cur
}

const statusMessage = computed(() => ({
  placed:    'Waiting for restaurant to confirm your order.',
  accepted:  'Restaurant confirmed! Getting ready to prepare.',
  preparing: 'Your order is being prepared.',
  ready:     'Order ready — rider is on the way to pick it up.',
  picked_up: 'Hold tight! Your order is on its way.',
  delivered: 'Your order has been delivered!',
  cancelled: 'This order was cancelled.',
} as Record<string, string>)[order.value?.status] ?? 'Tracking your order...')

const shortId    = computed(() => (orderId).slice(-8).toUpperCase())
const riderName  = computed(() => { const r = order.value?.riders; if (!r) return 'Searching for rider...'; const u = r.users; return u ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || 'Rider' : 'Rider' })
const riderPhone = computed(() => order.value?.riders?.users?.phone ?? '')
const riderRating = computed(() => order.value?.riders?.rating ?? '4.5')

const orderItems = computed(() =>
  (order.value?.order_items ?? []).map((i: any) => ({ id: i.id, name: i.menu_items?.name ?? 'Item', quantity: i.quantity, unitPrice: Number(i.unit_price ?? 0) }))
)

const codeInputRefs: HTMLInputElement[] = []
function onCodeInput(e: Event, i: number) {
  const v = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1)
  codeDigits.value[i] = v
  if (v && i < 3) {
    const next = document.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"]')[i + 1]
    next?.focus()
  }
}
function onCodeBackspace(_e: KeyboardEvent, i: number) {
  if (!codeDigits.value[i] && i > 0) {
    const prev = document.querySelectorAll<HTMLInputElement>('input[inputmode="numeric"]')[i - 1]
    prev?.focus()
  }
}

async function submitConfirm() {
  confirming.value = true
  try {
    await api.confirmOrder(orderId, codeDigits.value.join(''))
    confirmOpen.value = false
    toast.add({ title: 'Order confirmed!', color: 'success' })
    await refresh()
    showRateRider.value = true
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? 'Invalid code', color: 'error' })
  } finally {
    confirming.value = false
  }
}

async function submitVendorRating() {
  submittingVendor.value = true
  try {
    await api.reviewRestaurant(order.value?.restaurant_id, { order_id: orderId, rating: vendorRating.value, comment: vendorComment.value })
  } catch { /* silent */ } finally {
    submittingVendor.value = false
    showRateVendor.value = false
    toast.add({ title: 'Thanks for your feedback!', color: 'success' })
  }
}

async function submitRiderRating() {
  submittingRider.value = true
  try {
    await api.reviewRider(order.value?.rider_id, { order_id: orderId, rating: riderRatingVal.value, comment: riderComment.value })
  } catch { /* silent */ } finally {
    submittingRider.value = false
    showRateRider.value = false
    showRateVendor.value = true
  }
}

useSeoMeta({ title: 'Track Order — NearbyMe' })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: transform 0.3s, opacity 0.2s; }
.slide-down-enter-from, .slide-down-leave-to { transform: translateY(-12px); opacity: 0; }
</style>
