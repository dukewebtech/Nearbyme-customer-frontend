<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Payment Methods</h1>
    </div>

    <!-- Saved cards -->
    <div class="px-4 pt-4 space-y-3">
      <div v-if="pending" class="space-y-3">
        <USkeleton v-for="i in 2" :key="i" class="h-24 rounded-2xl" />
      </div>

      <template v-else>
        <!-- Existing cards -->
        <div
          v-for="card in cards"
          :key="card.id"
          class="bg-white rounded-2xl p-4 flex items-center gap-4"
        >
          <div class="w-12 h-8 rounded-lg flex items-center justify-center shrink-0"
            :class="card.card_type === 'visa' ? 'bg-blue-600' : card.card_type === 'mastercard' ? 'bg-[#eb001b]' : 'bg-gray-700'"
          >
            <span class="text-white text-[10px] font-bold uppercase">{{ card.card_type ?? 'Card' }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1e1e1e]">•••• •••• •••• {{ card.last4 ?? '0000' }}</p>
            <p class="text-xs text-[#969696] mt-0.5">Expires {{ card.exp_month }}/{{ card.exp_year }}</p>
          </div>
          <button class="w-8 h-8 rounded-full bg-[#ffe6e6] flex items-center justify-center shrink-0" @click="removeCard(card.id)">
            <UIcon name="i-lucide-trash-2" class="w-4 h-4 text-red-500" />
          </button>
        </div>

        <!-- Add new card button -->
        <button
          class="w-full bg-white rounded-2xl p-4 flex items-center gap-4 border-2 border-dashed border-brand-200"
          @click="showAddCard = true"
        >
          <div class="w-10 h-10 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-plus" class="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <p class="text-sm font-semibold text-brand-500">Add New Card</p>
            <p class="text-xs text-[#969696]">Credit or Debit card</p>
          </div>
        </button>

        <!-- Empty state -->
        <div v-if="!cards.length && !showAddCard" class="py-12 flex flex-col items-center text-center">
          <div class="w-20 h-20 rounded-full bg-[#fdefec] flex items-center justify-center mb-4">
            <UIcon name="i-lucide-credit-card" class="w-10 h-10 text-brand-500" />
          </div>
          <p class="text-base font-semibold text-[#191919]">No Saved Cards</p>
          <p class="text-sm text-[#969696] mt-1">Add a card to speed up checkout</p>
        </div>
      </template>
    </div>

    <!-- Add Card Sheet -->
    <UModal v-model:open="showAddCard">
      <template #content>
        <div class="p-5 space-y-4">
          <h2 class="text-base font-bold text-[#1e1e1e]">Add Card</h2>

          <div>
            <label class="block text-xs font-medium text-[#969696] mb-1.5">Card Type</label>
            <div class="flex gap-2">
              <button
                v-for="t in cardTypes"
                :key="t"
                class="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                :class="newCard.type === t ? 'bg-brand-500 text-white border-brand-500' : 'bg-[#f5f5f5] text-[#1e1e1e] border-transparent'"
                @click="newCard.type = t"
              >{{ t }}</button>
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#969696] mb-1.5">Card Number</label>
            <input
              v-model="newCard.number"
              type="text"
              placeholder="0000 0000 0000 0000"
              maxlength="19"
              class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none tracking-widest"
              @input="formatCardNumber"
            />
          </div>

          <div class="flex gap-3">
            <div class="flex-1">
              <label class="block text-xs font-medium text-[#969696] mb-1.5">Expiry Date</label>
              <input
                v-model="newCard.expiry"
                type="text"
                placeholder="MM/YY"
                maxlength="5"
                class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none"
                @input="formatExpiry"
              />
            </div>
            <div class="flex-1">
              <label class="block text-xs font-medium text-[#969696] mb-1.5">CVV</label>
              <input
                v-model="newCard.cvv"
                type="password"
                placeholder="•••"
                maxlength="4"
                class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-[#969696] mb-1.5">Cardholder Name</label>
            <input
              v-model="newCard.name"
              type="text"
              placeholder="Name on card"
              class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none"
            />
          </div>

          <p v-if="cardError" class="text-xs text-red-500 text-center">{{ cardError }}</p>

          <button
            class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
            :disabled="addingCard"
            @click="addCard"
          >
            <UIcon v-if="addingCard" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            Add Card
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api   = useApi()
const toast = useToast()

const { data, pending, refresh } = await useAsyncData('payment-methods', () => api.getPaymentMethods() as any, { server: false })
const cards = computed<any[]>(() => (data.value as any)?.data ?? [])

const showAddCard = ref(false)
const cardTypes   = ['Visa', 'Mastercard', 'Verve']
const cardError   = ref('')
const addingCard  = ref(false)

const newCard = reactive({ type: 'Visa', number: '', expiry: '', cvv: '', name: '' })

function formatCardNumber() {
  newCard.number = newCard.number.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry() {
  const v = newCard.expiry.replace(/\D/g, '').slice(0, 4)
  newCard.expiry = v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v
}

async function addCard() {
  cardError.value = ''
  if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
    cardError.value = 'Please fill in all fields'
    return
  }
  addingCard.value = true
  try {
    const [expMonth, expYear] = newCard.expiry.split('/')
    await api.createBeneficiary({
      card_type: newCard.type.toLowerCase(),
      card_number: newCard.number.replace(/\s/g, ''),
      cvv: newCard.cvv,
      exp_month: expMonth,
      exp_year: `20${expYear}`,
      cardholder_name: newCard.name,
    })
    toast.add({ title: 'Card added', color: 'success' })
    showAddCard.value = false
    newCard.number = ''; newCard.expiry = ''; newCard.cvv = ''; newCard.name = ''
    await refresh()
  } catch (e: any) {
    cardError.value = e?.data?.error ?? 'Could not add card'
  } finally { addingCard.value = false }
}

async function removeCard(id: string) {
  try {
    await api.deleteBeneficiary(id)
    await refresh()
    toast.add({ title: 'Card removed', color: 'success' })
  } catch {
    toast.add({ title: 'Could not remove card', color: 'error' })
  }
}

useSeoMeta({ title: 'Payment Methods — NearbyMe' })
</script>
