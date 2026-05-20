<template>
  <div class="min-h-screen bg-white max-w-[390px] mx-auto flex flex-col">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center shrink-0" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Delivery Address</h1>
    </div>

    <!-- Map -->
    <div class="mx-4 rounded-2xl overflow-hidden h-[200px] bg-[#f0f0f0] relative">
      <iframe
        class="w-full h-full border-0"
        :src="mapSrc"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        title="Map"
      />
    </div>

    <!-- Use current location -->
    <button class="flex items-center gap-2 px-4 py-4 text-brand-500 font-semibold text-sm" @click="useCurrentLocation">
      <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
      Use my current location
    </button>

    <!-- New address input -->
    <div class="px-4 mb-4">
      <div class="bg-[#f5f5f5] rounded-full px-4 py-3.5 flex items-center gap-3">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696] shrink-0" />
        <input
          v-model="newAddress"
          type="text"
          placeholder="Enter a new address"
          class="flex-1 bg-transparent text-sm text-[#1e1e1e] placeholder:text-[#bababa] outline-none"
          @keydown.enter="saveNewAddress"
        />
        <button v-if="newAddress" class="shrink-0" @click="saveNewAddress">
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4 text-brand-500" />
        </button>
      </div>
    </div>

    <!-- Saved addresses -->
    <div class="flex-1 px-4">
      <div v-if="loading" class="space-y-4 py-2">
        <USkeleton v-for="i in 3" :key="i" class="h-14 rounded-xl" />
      </div>

      <div v-else class="divide-y divide-gray-100">
        <button
          v-for="addr in addresses"
          :key="addr.id"
          class="w-full py-4 flex items-start gap-3 text-left"
          @click="selectAddress(addr)"
        >
          <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-[#969696] mt-0.5 shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ addr.label || addr.address }}</p>
            <p class="text-xs text-[#969696] mt-0.5 truncate">{{ addr.label ? addr.address : addr.city }}</p>
          </div>
          <button class="shrink-0 p-1" @click.stop="deleteAddr(addr.id)">
            <UIcon name="i-lucide-x" class="w-3.5 h-3.5 text-[#c0c0c0]" />
          </button>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()
const toast = useToast()
const newAddress = ref('')
const loading = ref(true)
const addresses = ref<any[]>([])

const userLat = import.meta.client ? (localStorage.getItem('userLat') || '6.524') : '6.524'
const userLng = import.meta.client ? (localStorage.getItem('userLng') || '3.379') : '3.379'

const mapSrc = computed(() =>
  `https://www.openstreetmap.org/export/embed.html?bbox=${Number(userLng) - 0.03},${Number(userLat) - 0.03},${Number(userLng) + 0.03},${Number(userLat) + 0.03}&layer=mapnik&marker=${userLat},${userLng}`
)

onMounted(async () => {
  try {
    const res = await api.getAddresses() as any
    addresses.value = res.data ?? []
  } catch {
    // show empty state if API not ready
  } finally {
    loading.value = false
  }
})

function selectAddress(addr: any) {
  if (import.meta.client) {
    localStorage.setItem('deliveryAddress', addr.address)
    if (addr.latitude) localStorage.setItem('deliveryLat', addr.latitude)
    if (addr.longitude) localStorage.setItem('deliveryLng', addr.longitude)
  }
  navigateTo(-1 as any)
}

async function saveNewAddress() {
  if (!newAddress.value.trim()) return
  try {
    const res = await api.createAddress({ address: newAddress.value, latitude: 6.524, longitude: 3.379 }) as any
    addresses.value.unshift(res.data)
    newAddress.value = ''
    toast.add({ title: 'Address saved', color: 'success' })
  } catch {
    if (import.meta.client) {
      localStorage.setItem('deliveryAddress', newAddress.value)
      navigateTo(-1 as any)
    }
  }
}

function useCurrentLocation() {
  if (!import.meta.client || !navigator.geolocation) return
  navigator.geolocation.getCurrentPosition((pos) => {
    localStorage.setItem('userLat', pos.coords.latitude.toString())
    localStorage.setItem('userLng', pos.coords.longitude.toString())
    localStorage.setItem('deliveryLat', pos.coords.latitude.toString())
    localStorage.setItem('deliveryLng', pos.coords.longitude.toString())
    toast.add({ title: 'Location updated', color: 'success' })
    navigateTo(-1 as any)
  })
}

async function deleteAddr(id: string) {
  try {
    await api.deleteAddress(id)
    addresses.value = addresses.value.filter(a => a.id !== id)
  } catch {
    toast.add({ title: 'Could not remove address', color: 'error' })
  }
}

useSeoMeta({ title: 'Delivery Address — NearbyMe' })
</script>
