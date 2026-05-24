<template>
  <div class="min-h-screen bg-white max-w-[390px] mx-auto pb-48">
    <!-- Header -->
    <div class="px-4 pt-12 pb-2">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Send as a gift</h1>
      <p class="text-sm text-[#969696] mt-0.5">Surprise someone special</p>
    </div>

    <!-- Illustration -->
    <div class="mx-4 mt-4 mb-5 h-44 rounded-2xl overflow-hidden bg-amber-50 flex items-center justify-center relative">
      <div class="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100" />
      <div class="relative flex flex-col items-center gap-1">
        <span class="text-7xl leading-none">🎁</span>
        <span class="text-2xl leading-none">🌟</span>
      </div>
    </div>

    <!-- Form -->
    <div class="px-4 space-y-5">
      <!-- Sender's Name (read-only — backend fetches from profile) -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">Sender's Name</p>
        <div class="bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm text-[#1e1e1e]">
          {{ senderName }}
        </div>
      </div>

      <!-- Receiver's Name -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">Receiver's Name</p>
        <input
          v-model="form.name"
          type="text"
          placeholder="Enter receiver's name"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm text-[#1e1e1e] outline-none placeholder:text-[#bdbdbd]"
        />
      </div>

      <!-- Receiver's Phone -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">Receiver's Phone Number</p>
        <input
          v-model="form.phone"
          type="tel"
          placeholder="e.g 080xxxxxxxx"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm text-[#1e1e1e] outline-none placeholder:text-[#bdbdbd]"
        />
      </div>

      <!-- Receiver's Address -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">Receiver's Address</p>
        <div class="relative">
          <UIcon name="i-lucide-map-pin" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#969696] pointer-events-none" />
          <input
            v-model="form.address"
            type="text"
            placeholder="Enter receiver's address"
            class="w-full bg-[#f5f5f5] rounded-2xl pl-10 pr-4 py-3.5 text-sm text-[#1e1e1e] outline-none placeholder:text-[#bdbdbd]"
          />
        </div>
      </div>

      <!-- Receiver's Email (optional) -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">
          Receiver's Email Address
          <span class="text-[#969696] font-normal">(optional)</span>
        </p>
        <input
          v-model="form.email"
          type="email"
          placeholder="e.g henryjohnson@gmail.com"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm text-[#1e1e1e] outline-none placeholder:text-[#bdbdbd]"
        />
      </div>

      <!-- Note (optional) -->
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e] mb-2">
          Note
          <span class="text-[#969696] font-normal">(optional)</span>
        </p>
        <textarea
          v-model="form.note"
          rows="3"
          placeholder="Add a special note to this gift"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm text-[#1e1e1e] outline-none resize-none placeholder:text-[#bdbdbd]"
        />
      </div>

      <!-- Save as beneficiary -->
      <button
        class="flex items-center gap-3 w-full py-1"
        @click="saveAsBeneficiary = !saveAsBeneficiary"
      >
        <div
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
          :class="saveAsBeneficiary ? 'border-brand-500 bg-brand-500' : 'border-gray-300'"
        >
          <div v-if="saveAsBeneficiary" class="w-2 h-2 rounded-full bg-white" />
        </div>
        <span class="text-sm font-medium text-[#1e1e1e]">Save as beneficiary</span>
      </button>
    </div>
  </div>

  <!-- Fixed bottom bar -->
  <div class="fixed bottom-20 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-gray-100 px-4 pt-4 pb-4">
    <button
      class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold active:scale-[0.98] transition-transform"
      @click="proceed"
    >
      Proceed to Checkout
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth      = useAuthStore()
const giftStore = useGiftStore()
const toast     = useToast()

const senderName = computed(() => {
  const u  = auth.user as any
  const fn = u?.user_metadata?.first_name ?? u?.first_name ?? ''
  const ln = u?.user_metadata?.last_name  ?? u?.last_name  ?? ''
  return [fn, ln].filter(Boolean).join(' ') || u?.email?.split('@')[0] || 'You'
})

// Pre-fill from store if user already filled this form
const form = reactive({
  name:    giftStore.name,
  phone:   giftStore.phone,
  email:   giftStore.email,
  address: giftStore.address,
  note:    giftStore.note,
})

const saveAsBeneficiary = ref(false)

async function proceed() {
  if (!form.name.trim()) {
    toast.add({ title: "Receiver's name is required", color: 'error' })
    return
  }
  if (!form.phone.trim() && !form.email.trim()) {
    toast.add({ title: "Enter the receiver's phone number or email so we can notify them", color: 'error' })
    return
  }

  if (saveAsBeneficiary.value && form.name.trim() && form.phone.trim() && form.address.trim()) {
    try {
      const apiComp = useApi()
      await apiComp.createBeneficiary({
        name:    form.name.trim(),
        phone:   form.phone.trim(),
        email:   form.email.trim() || null,
        address: form.address.trim(),
      })
    } catch { /* silent — don't block checkout if save fails */ }
  }

  giftStore.activate({ ...form })
  navigateTo('/cart')
}

useSeoMeta({ title: 'Send as a Gift — NearbyMe' })
</script>
