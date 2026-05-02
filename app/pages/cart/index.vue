<template>
  <div class="pb-[72px] min-h-screen bg-white">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-2xl font-semibold text-[#191919]">My Cart</h1>
    </div>

    <div v-if="cartStore.loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
    </div>

    <!-- Cart has items -->
    <template v-else-if="items.length">
      <div class="px-4 space-y-3 mb-4">
        <div v-for="item in items" :key="item.id" class="flex gap-3">
          <div class="w-20 h-20 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
            <img v-if="item.menu_items?.image_url" :src="item.menu_items.image_url" class="w-full h-full object-cover" />
            <UIcon v-else name="i-lucide-utensils" class="w-7 h-7 text-brand-300" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1e1e1e]">{{ item.menu_items?.name ?? 'Item' }}</p>
            <p class="text-xs text-[#969696] mt-0.5">{{ item.special_instructions }}</p>
            <div class="flex items-center justify-between mt-2">
              <p class="text-sm font-semibold text-brand-500">₦{{ (Number(item.unit_price) * item.quantity).toLocaleString('en-NG') }}</p>
              <div class="flex items-center gap-2">
                <button
                  class="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center"
                  @click="updateItem(item.id, item.quantity - 1)"
                >
                  <UIcon name="i-lucide-minus" class="w-3.5 h-3.5 text-[#1e1e1e]" />
                </button>
                <span class="text-sm font-semibold w-4 text-center text-[#1e1e1e]">{{ item.quantity }}</span>
                <button
                  class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center"
                  @click="updateItem(item.id, item.quantity + 1)"
                >
                  <UIcon name="i-lucide-plus" class="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery address -->
      <div class="mx-4 mb-4">
        <p class="text-sm font-medium text-[#585858] mb-2">Delivery address</p>
        <div class="bg-[#fdefec] rounded-xl px-3 py-3 flex items-start gap-2">
          <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <p class="text-sm text-[#212121]">{{ deliveryAddress || 'Add delivery address' }}</p>
        </div>
      </div>

      <!-- Order summary -->
      <div class="mx-4 mb-4">
        <p class="text-sm font-semibold text-[#522217] mb-3">Order Summary</p>
        <div class="space-y-2">
          <div class="flex justify-between text-sm text-[#522217]">
            <span>Items ({{ items.length }} items)</span>
            <span class="font-medium">₦{{ cartStore.subtotal.toLocaleString('en-NG') }}</span>
          </div>
          <div class="flex justify-between text-sm text-[#522217]">
            <span>Delivery Fee</span>
            <span class="font-medium">₦500</span>
          </div>
          <div class="flex justify-between text-sm text-[#969696]">
            <span>Service Fee</span>
            <span>₦200</span>
          </div>
          <div class="flex justify-between text-sm font-semibold text-[#522217] pt-2 border-t border-[#f5e9e7]">
            <span>Total</span>
            <span>₦{{ (cartStore.subtotal + 700).toLocaleString('en-NG') }}</span>
          </div>
        </div>
      </div>

      <!-- Payment method -->
      <div class="mx-4 mb-4">
        <p class="text-sm font-medium text-[#212121] mb-3">Payment Method</p>
        <div class="flex items-center gap-3 bg-[#fdefec] border border-brand-200 rounded-2xl px-4 py-3">
          <UIcon name="i-lucide-credit-card" class="w-5 h-5 text-brand-500 shrink-0" />
          <div>
            <p class="text-sm font-semibold text-[#212121]">Pay with Paystack</p>
            <p class="text-xs text-[#6d717f]">Card, bank transfer, USSD — secured by Paystack</p>
          </div>
          <img src="https://website-v3-assets.s3.amazonaws.com/assets/img/hero/Paystack-mark-white-twitter.png" class="ml-auto w-8 h-8 rounded-full bg-[#00c3f7] object-contain p-1 shrink-0" />
        </div>
      </div>

      <div class="px-4 pb-6">
        <button
          class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          :disabled="placing"
          @click="placeOrder"
        >
          <UIcon v-if="placing" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
          {{ placing ? 'Redirecting to Paystack…' : `Pay ₦${(cartStore.subtotal + 700).toLocaleString('en-NG')}` }}
        </button>
        <p class="text-center text-xs text-[#969696] mt-2">Secured by Paystack · You'll be redirected to complete payment</p>
      </div>
    </template>

    <!-- Pending payment — cart was cleared after order was created but payment not completed -->
    <div v-else-if="pendingOrderId" class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-[#fdefec] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-clock" class="w-8 h-8 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">You have an incomplete payment</p>
      <p class="text-sm text-[#969696] mt-1 mb-6">Your order was created but payment was not completed.</p>
      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-60 mb-3"
        :disabled="placing"
        @click="resumePayment"
      >
        <UIcon v-if="placing" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        {{ placing ? 'Redirecting to Paystack…' : 'Complete Payment' }}
      </button>
      <button class="text-sm text-[#969696]" @click="clearPending">
        Cancel and start over
      </button>
    </div>

    <!-- Empty cart -->
    <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
      <UIcon name="i-lucide-shopping-cart" class="w-14 h-14 text-gray-300 mb-4" />
      <p class="text-base font-semibold text-[#191919]">Your cart is empty</p>
      <p class="text-sm text-[#969696] mt-1 mb-6">Add items from a restaurant to get started</p>
      <NuxtLink to="/" class="bg-brand-500 text-white text-sm font-semibold px-8 py-3 rounded-full">
        Explore Restaurants
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const cartStore = useCartStore()
const api = useApi()
const toast = useToast()

const placing = ref(false)
const deliveryAddress = ref('Omoba Murphy Adetoro Street, Lagos')
const items = computed(() => cartStore.items)

const pendingOrderId = ref<string | null>(null)
const pendingPaymentId = ref<string | null>(null)

onMounted(() => {
  cartStore.fetchCart()
  // Restore pending order if the user came back without completing payment
  const stored = sessionStorage.getItem('nearbymePayment')
  if (stored) {
    try {
      const { orderId, paymentId } = JSON.parse(stored)
      pendingOrderId.value = orderId ?? null
      pendingPaymentId.value = paymentId ?? null
    } catch {}
  }
})

async function updateItem(cartItemId: string, qty: number) {
  await cartStore.updateItem(cartItemId, qty)
}

async function redirectToPaystack(orderId: string) {
  const callbackUrl = `${window.location.origin}/payment/callback`
  const payRes = await api.initiatePayment(orderId, 'card', callbackUrl) as any
  const authUrl = payRes.data?.paystack_authorization_url
  const paymentId = payRes.data?.id
  if (!authUrl) throw new Error('Could not get payment link from Paystack')
  // Persist so the callback page can verify
  sessionStorage.setItem('nearbymePayment', JSON.stringify({ orderId, paymentId }))
  pendingOrderId.value = orderId
  pendingPaymentId.value = paymentId
  window.location.href = authUrl
}

async function placeOrder() {
  if (placing.value) return
  placing.value = true
  try {
    if (!items.value.length) {
      toast.add({ title: 'Your cart is empty', color: 'error' })
      placing.value = false
      return
    }
    const orderRes = await api.placeOrder({
      delivery_address: deliveryAddress.value,
      delivery_latitude: 6.4281,
      delivery_longitude: 3.4219,
    }) as any
    const orderId = orderRes.data?.id
    if (!orderId) throw new Error('Order creation failed')
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
  pendingOrderId.value = null
  pendingPaymentId.value = null
}

useSeoMeta({ title: 'My Cart — NearbyMe' })
</script>
