<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">My Cart</h1>
      <span v-if="items.length" class="ml-auto text-sm text-[#969696]">{{ items.length }} item{{ items.length > 1 ? 's' : '' }}</span>
    </div>

    <div v-if="cartStore.loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
    </div>

    <!-- Pending payment state -->
    <div v-else-if="pendingOrderId && !items.length" class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-[#fdefec] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-clock" class="w-8 h-8 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">Incomplete Payment</p>
      <p class="text-sm text-[#969696] mt-1 mb-6">Your order was created but payment was not completed.</p>
      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mb-3"
        :disabled="placing"
        @click="resumePayment"
      >
        <UIcon v-if="placing" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        {{ placing ? 'Redirecting…' : 'Complete Payment' }}
      </button>
      <button class="text-sm text-[#969696]" @click="clearPending">Cancel and start over</button>
    </div>

    <!-- Cart has items -->
    <template v-else-if="items.length">
      <!-- Delivery Map -->
      <div class="relative h-40 bg-gray-100 overflow-hidden">
        <iframe
          :src="`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`"
          class="w-full h-full border-0 pointer-events-none"
          loading="lazy"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent pointer-events-none" />
      </div>

      <!-- Delivery address -->
      <div class="bg-white mx-4 -mt-5 rounded-2xl shadow-sm p-4 mb-4 relative z-10">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-brand-500" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold text-[#969696] uppercase tracking-wide">Deliver to</p>
            <p class="text-sm font-semibold text-[#1e1e1e] mt-0.5 truncate">{{ deliveryAddress }}</p>
          </div>
          <button class="text-xs font-semibold text-brand-500 shrink-0" @click="navigateTo('/addresses')">Change</button>
        </div>
      </div>

      <!-- Cart items -->
      <div class="px-4 space-y-3 mb-4">
        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-2xl p-3 flex gap-3"
        >
          <div class="w-18 h-18 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center" style="width:72px;height:72px">
            <img v-if="item.menu_items?.image_url" :src="item.menu_items.image_url" class="w-full h-full object-cover" />
            <UIcon v-else name="i-lucide-utensils" class="w-7 h-7 text-brand-300" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1e1e1e] leading-tight">{{ item.menu_items?.name ?? 'Item' }}</p>
            <p v-if="item.special_instructions" class="text-[10px] text-[#969696] mt-0.5 truncate">{{ item.special_instructions }}</p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-sm font-bold text-brand-500">₦{{ (Number(item.unit_price) * item.quantity).toLocaleString('en-NG') }}</p>
              <div class="flex items-center gap-2">
                <button
                  class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"
                  @click="updateItem(item.id, item.quantity - 1)"
                >
                  <UIcon name="i-lucide-minus" class="w-3 h-3 text-[#1e1e1e]" />
                </button>
                <span class="text-sm font-semibold w-4 text-center text-[#1e1e1e]">{{ item.quantity }}</span>
                <button
                  class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center"
                  @click="updateItem(item.id, item.quantity + 1)"
                >
                  <UIcon name="i-lucide-plus" class="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gift banner -->
      <div class="px-4 mb-4">
        <button
          class="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-colors active:scale-[0.98] transition-transform"
          :class="giftStore.isActive ? 'bg-brand-500' : 'bg-amber-50'"
          @click="navigateTo('/cart/gift')"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            :class="giftStore.isActive ? 'bg-white/20' : 'bg-amber-100'"
          >
            <UIcon name="i-lucide-gift" class="w-5 h-5" :class="giftStore.isActive ? 'text-white' : 'text-amber-500'" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold truncate" :class="giftStore.isActive ? 'text-white' : 'text-amber-900'">
              {{ giftStore.isActive ? `Gift · ${giftStore.name}` : 'Send as a gift' }}
            </p>
            <p class="text-xs" :class="giftStore.isActive ? 'text-white/80' : 'text-amber-700'">
              {{ giftStore.isActive ? 'Tap to edit recipient details' : 'Surprise someone special with a meal' }}
            </p>
          </div>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4 shrink-0" :class="giftStore.isActive ? 'text-white' : 'text-amber-400'" />
        </button>
      </div>

      <!-- Promo code -->
      <div class="px-4 mb-4">
        <div class="bg-white rounded-2xl p-4 flex gap-2">
          <UIcon name="i-lucide-tag" class="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <input
            v-model="promoCode"
            type="text"
            placeholder="Enter promo code"
            class="flex-1 text-sm text-[#1e1e1e] outline-none bg-transparent"
            @keyup.enter="applyPromo"
          />
          <button class="text-sm font-semibold text-brand-500 shrink-0" @click="applyPromo">Apply</button>
        </div>
        <p v-if="promoMsg" class="text-xs mt-1 px-1" :class="promoSuccess ? 'text-green-600' : 'text-red-500'">{{ promoMsg }}</p>
      </div>

      <!-- Order summary -->
      <div class="px-4 mb-4">
        <div class="bg-white rounded-2xl p-4">
          <p class="text-sm font-bold text-[#1e1e1e] mb-3">Order Summary</p>
          <div class="space-y-2.5">
            <div class="flex justify-between text-sm text-[#585858]">
              <span>Subtotal</span>
              <span class="font-medium">₦{{ cartStore.subtotal.toLocaleString('en-NG') }}</span>
            </div>
            <div class="flex justify-between text-sm text-[#585858]">
              <span>Delivery Fee</span>
              <span class="font-medium">₦500</span>
            </div>
            <div class="flex justify-between text-sm text-[#585858]">
              <span>Service Fee</span>
              <span class="font-medium">₦200</span>
            </div>
            <div v-if="discount" class="flex justify-between text-sm text-green-600">
              <span>Promo Discount</span>
              <span class="font-medium">-₦{{ discount.toLocaleString('en-NG') }}</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-[#1e1e1e] pt-2.5 border-t border-dashed border-gray-200">
              <span>Total</span>
              <span>₦{{ total.toLocaleString('en-NG') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment method -->
      <div class="px-4 mb-6">
        <p class="text-sm font-bold text-[#1e1e1e] mb-3">Payment Method</p>
        <div class="space-y-2">
          <button
            v-for="method in paymentMethods"
            :key="method.id"
            class="w-full bg-white rounded-2xl p-4 flex items-center gap-3 border-2 transition-colors"
            :class="selectedPayment === method.id ? 'border-brand-500' : 'border-transparent'"
            @click="selectedPayment = method.id"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="selectedPayment === method.id ? 'bg-brand-500' : 'bg-[#fdefec]'"
            >
              <UIcon :name="method.icon" class="w-5 h-5" :class="selectedPayment === method.id ? 'text-white' : 'text-brand-500'" />
            </div>
            <div class="flex-1 text-left">
              <p class="text-sm font-semibold text-[#1e1e1e]">{{ method.label }}</p>
              <p class="text-xs text-[#969696]">{{ method.desc }}</p>
            </div>
            <div
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
              :class="selectedPayment === method.id ? 'border-brand-500 bg-brand-500' : 'border-gray-300'"
            >
              <div v-if="selectedPayment === method.id" class="w-2 h-2 rounded-full bg-white" />
            </div>
          </button>
        </div>
      </div>

      <!-- Place order button -->
      <div class="px-4 pb-8">
        <button
          class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          :disabled="placing"
          @click="placeOrder"
        >
          <UIcon v-if="placing" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
          {{ placing ? 'Processing…' : `Pay ₦${total.toLocaleString('en-NG')}` }}
        </button>
        <p class="text-center text-xs text-[#969696] mt-2">Secured by Paystack · All transactions are encrypted</p>
      </div>
    </template>

    <!-- Empty cart -->
    <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[#fdefec] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-shopping-cart" class="w-10 h-10 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">Your cart is empty</p>
      <p class="text-sm text-[#969696] mt-1 mb-6">Add items from a restaurant to get started</p>
      <NuxtLink to="/" class="bg-brand-500 text-white text-sm font-semibold px-8 py-3.5 rounded-full">
        Explore Restaurants
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const cartStore = useCartStore()
const api   = useApi()
const toast = useToast()

const placing        = ref(false)
const deliveryAddress = ref('Omoba Murphy Adetoro Street, Lagos')
const lat            = ref(6.5244)
const lng            = ref(3.3792)

const giftStore = useGiftStore()

const promoCode    = ref('')
const promoMsg     = ref('')
const promoSuccess = ref(false)
const discount     = ref(0)

const selectedPayment = ref('card')

const paymentMethods = [
  { id: 'card',     icon: 'i-lucide-credit-card',   label: 'Credit / Debit Card',    desc: 'Visa, Mastercard, Verve — instant payment' },
  { id: 'transfer', icon: 'i-lucide-landmark',       label: 'Bank Transfer',          desc: 'Pay via direct bank transfer' },
  { id: 'ussd',     icon: 'i-lucide-hash',           label: 'USSD',                   desc: 'Pay with USSD code on any phone' },
]

const items = computed(() => cartStore.items)
const total = computed(() => Math.max(0, cartStore.subtotal + 700 - discount.value))

const pendingOrderId   = ref<string | null>(null)
const pendingPaymentId = ref<string | null>(null)

onMounted(async () => {
  await cartStore.fetchCart()

  const stored = sessionStorage.getItem('nearbymePayment')
  if (stored) {
    try {
      const { orderId, paymentId } = JSON.parse(stored)
      pendingOrderId.value   = orderId ?? null
      pendingPaymentId.value = paymentId ?? null
    } catch {}
  }

  // Pull saved address from localStorage
  if (import.meta.client) {
    const savedAddr = localStorage.getItem('deliveryAddress')
    if (savedAddr) deliveryAddress.value = savedAddr
    const savedLat = localStorage.getItem('userLat')
    const savedLng = localStorage.getItem('userLng')
    if (savedLat && savedLng) { lat.value = parseFloat(savedLat); lng.value = parseFloat(savedLng) }
  }
})

async function updateItem(cartItemId: string, qty: number) {
  await cartStore.updateItem(cartItemId, qty)
}

async function applyPromo() {
  if (!promoCode.value.trim()) return
  try {
    const res = await api.applyPromo(promoCode.value.trim()) as any
    discount.value = res.data?.discount ?? 0
    promoMsg.value   = `Promo applied! You save ₦${discount.value.toLocaleString('en-NG')}`
    promoSuccess.value = true
  } catch (e: any) {
    promoMsg.value    = e?.data?.error ?? 'Invalid promo code'
    promoSuccess.value = false
    discount.value    = 0
  }
}

async function redirectToPaystack(orderId: string) {
  const callbackUrl = `${window.location.origin}/payment/callback`
  const payRes = await api.initiatePayment(orderId, selectedPayment.value, callbackUrl) as any
  const authUrl   = payRes.data?.paystack_authorization_url
  const paymentId = payRes.data?.id
  if (!authUrl) throw new Error('Could not get payment link')
  sessionStorage.setItem('nearbymePayment', JSON.stringify({ orderId, paymentId }))
  pendingOrderId.value   = orderId
  pendingPaymentId.value = paymentId
  window.location.href = authUrl
}

async function placeOrder() {
  if (placing.value) return
  placing.value = true
  try {
    const orderBody: Record<string, any> = {
      delivery_address:   giftStore.isActive && giftStore.address ? giftStore.address : deliveryAddress.value,
      delivery_latitude:  lat.value,
      delivery_longitude: lng.value,
    }
    if (giftStore.isActive) {
      orderBody.is_gift              = true
      orderBody.gift_recipient_name  = giftStore.name
      orderBody.gift_recipient_phone = giftStore.phone || null
      orderBody.gift_recipient_email = giftStore.email || null
      orderBody.gift_message         = giftStore.note  || null
    }
    const orderRes = await api.placeOrder(orderBody) as any
    const orderId  = orderRes.data?.id
    if (!orderId) throw new Error('Order creation failed')
    giftStore.clear()
    await redirectToPaystack(orderId)
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? e?.message ?? 'Could not process order', color: 'error' })
    placing.value = false
  }
}

async function resumePayment() {
  if (placing.value || !pendingOrderId.value) return
  placing.value = true
  try {
    await redirectToPaystack(pendingOrderId.value)
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? e?.message ?? 'Could not resume payment', color: 'error' })
    placing.value = false
  }
}

function clearPending() {
  sessionStorage.removeItem('nearbymePayment')
  pendingOrderId.value   = null
  pendingPaymentId.value = null
}

useSeoMeta({ title: 'My Cart — NearbyMe' })
</script>
