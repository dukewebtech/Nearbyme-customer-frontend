<template>
  <div class="min-h-screen bg-white max-w-[390px] mx-auto pb-48">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-4" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Saved Beneficiary</h1>
      <p class="text-sm text-[#969696] mt-0.5">Send order to already saved beneficiary or add a new one</p>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="px-4 space-y-4 mt-2">
      <div v-for="i in 2" :key="i" class="border border-gray-100 rounded-2xl p-4 space-y-2">
        <USkeleton class="h-4 w-32 rounded" />
        <USkeleton class="h-3 w-48 rounded" />
        <USkeleton class="h-3 w-40 rounded" />
      </div>
    </div>

    <!-- Beneficiary list -->
    <div v-else-if="beneficiaries.length" class="px-4 divide-y divide-gray-100">
      <div
        v-for="b in beneficiaries"
        :key="b.id"
        class="py-4 cursor-pointer active:bg-gray-50 rounded-xl transition-colors"
        @click="select(b)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-1">
              <div>
                <p class="text-[10px] text-[#969696] uppercase tracking-wide">Name</p>
                <p class="text-sm font-semibold text-[#1e1e1e]">{{ b.name }}</p>
              </div>
              <div class="text-right">
                <p class="text-[10px] text-[#969696] uppercase tracking-wide">Phone Number</p>
                <p class="text-sm font-semibold text-[#1e1e1e]">{{ b.phone }}</p>
              </div>
            </div>
            <p class="text-[10px] text-[#969696] uppercase tracking-wide mt-2">Address</p>
            <p class="text-sm text-[#585858]">{{ b.address }}</p>
          </div>
        </div>
        <div class="flex justify-end mt-3">
          <button
            class="text-xs font-semibold text-red-400 px-3 py-1 rounded-full border border-red-100 active:bg-red-50"
            @click.stop="remove(b.id)"
          >
            Remove
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-users" class="w-8 h-8 text-amber-400" />
      </div>
      <p class="text-sm font-semibold text-[#1e1e1e]">No saved beneficiaries</p>
      <p class="text-xs text-[#969696] mt-1">Add one below to quickly send gifts</p>
    </div>
  </div>

  <!-- Fixed bottom: Add Beneficiary — sits above the bottom nav bar -->
  <div class="fixed bottom-20 left-0 right-0 max-w-[390px] mx-auto bg-white border-t border-gray-100 px-4 pt-4 pb-4">
    <button
      class="w-full py-4 rounded-full border-2 border-brand-500 text-brand-500 text-base font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      @click="addNew"
    >
      <UIcon name="i-lucide-plus" class="w-5 h-5" />
      Add Beneficiary
    </button>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api       = useApi()
const giftStore = useGiftStore()
const toast     = useToast()

const pending       = ref(true)
const beneficiaries = ref<any[]>([])

async function load() {
  pending.value = true
  try {
    const res = await api.getBeneficiaries() as any
    beneficiaries.value = res.data ?? []
  } catch {
    beneficiaries.value = []
  } finally {
    pending.value = false
  }
}

function select(b: any) {
  giftStore.activate({
    name:    b.name,
    phone:   b.phone ?? '',
    email:   b.email ?? '',
    address: b.address ?? '',
    note:    '',
  })
  navigateTo('/cart/gift')
}

function addNew() {
  giftStore.clear()
  navigateTo('/cart/gift')
}

async function remove(id: string) {
  try {
    await api.deleteBeneficiary(id)
    beneficiaries.value = beneficiaries.value.filter(b => b.id !== id)
  } catch {
    toast.add({ title: 'Could not remove beneficiary', color: 'error' })
  }
}

onMounted(load)

useSeoMeta({ title: 'Saved Beneficiaries — NearbyMe' })
</script>
