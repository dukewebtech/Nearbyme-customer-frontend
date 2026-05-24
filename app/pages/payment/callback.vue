<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">

    <!-- Verifying -->
    <template v-if="status === 'verifying'">
      <UIcon name="i-lucide-loader-circle" class="w-14 h-14 text-brand-500 animate-spin mb-5" />
      <p class="text-lg font-semibold text-[#1e1e1e]">Verifying your payment…</p>
      <p class="text-sm text-[#969696] mt-1">Please wait, do not close this page</p>
    </template>

    <!-- Success -->
    <template v-else-if="status === 'success'">
      <div class="w-24 h-24 rounded-full bg-[#fdefec] flex items-center justify-center mb-6">
        <UIcon name="i-lucide-check-circle-2" class="w-12 h-12 text-brand-500" />
      </div>
      <h1 class="text-2xl font-bold text-[#1e1e1e] mb-2">Payment Successful!</h1>
      <p class="text-sm text-[#585858] mb-6 max-w-xs">
        Your order has been confirmed and the restaurant is getting started on it.
      </p>

      <!-- TEMP: gift notification debug banner -->
      <div v-if="giftDebug" class="w-full max-w-sm mb-6 rounded-2xl border text-left text-xs p-4"
        :class="giftDebug.email?.sent ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
      >
        <p class="font-semibold mb-1" :class="giftDebug.email?.sent ? 'text-green-700' : 'text-red-700'">
          {{ giftDebug.email?.sent ? '✅ Gift email sent!' : '❌ Gift email failed' }}
        </p>
        <p v-if="giftDebug.email?.error" class="text-red-600 break-all">{{ giftDebug.email.error }}</p>
        <p v-if="giftDebug.whatsapp" class="mt-1" :class="giftDebug.whatsapp.sent ? 'text-green-600' : 'text-red-600'">
          WhatsApp: {{ giftDebug.whatsapp.sent ? '✅ sent' : '❌ ' + giftDebug.whatsapp.error }}
        </p>
      </div>

      <NuxtLink
        :to="`/orders/${orderId}`"
        class="w-full max-w-sm py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center gap-2 mb-3"
      >
        <UIcon name="i-lucide-bike" class="w-5 h-5" />
        Track My Order
      </NuxtLink>
      <NuxtLink to="/" class="text-sm text-[#969696] py-2">
        Back to Home
      </NuxtLink>
    </template>

    <!-- Error -->
    <template v-else-if="status === 'error'">
      <div class="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
        <UIcon name="i-lucide-x-circle" class="w-12 h-12 text-red-400" />
      </div>
      <h1 class="text-xl font-bold text-[#1e1e1e] mb-2">Payment Failed</h1>
      <p class="text-sm text-[#585858] mb-8 max-w-xs">{{ errorMessage }}</p>
      <NuxtLink
        to="/cart"
        class="w-full max-w-sm py-4 rounded-full bg-brand-500 text-white text-base font-semibold flex items-center justify-center mb-3"
      >
        Try Again
      </NuxtLink>
      <NuxtLink to="/" class="text-sm text-[#969696] py-2">
        Back to Home
      </NuxtLink>
    </template>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()

const status = ref<'verifying' | 'success' | 'error'>('verifying')
const orderId = ref<string | null>(null)
const errorMessage = ref('Something went wrong. Please try again.')
const giftDebug = ref<any>(null)

onMounted(async () => {
  const reference = (route.query.reference ?? route.query.trxref) as string | undefined

  const stored = sessionStorage.getItem('nearbymePayment')
  if (!stored) {
    status.value = 'error'
    errorMessage.value = 'Payment session expired. If you were charged, please contact support.'
    return
  }

  let paymentId: string | undefined
  let oid: string | undefined
  try {
    const parsed = JSON.parse(stored)
    paymentId = parsed.paymentId
    oid = parsed.orderId
  } catch {
    status.value = 'error'
    errorMessage.value = 'Invalid payment session. Please try again.'
    return
  }

  if (!reference || !paymentId || !oid) {
    status.value = 'error'
    errorMessage.value = 'Missing payment details. Please try again from the cart.'
    return
  }

  orderId.value = oid

  try {
    await api.verifyPayment(paymentId, reference)
    sessionStorage.removeItem('nearbymePayment')

    // TEMP: read gift notification debug result
    const debugRaw = sessionStorage.getItem('giftNotifDebug')
    if (debugRaw) {
      try { giftDebug.value = JSON.parse(debugRaw) } catch {}
      sessionStorage.removeItem('giftNotifDebug')
    }

    status.value = 'success'
  } catch (e: any) {
    status.value = 'error'
    errorMessage.value = e?.data?.error ?? e?.message ?? 'Payment verification failed. Please contact support if you were charged.'
  }
})

useSeoMeta({ title: 'Payment — NearbyMe' })
</script>
