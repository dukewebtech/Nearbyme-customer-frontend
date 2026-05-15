<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <div class="bg-white px-4 pt-12 pb-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-sm text-[#969696]">Shops & Groceries</p>
          <p class="text-base font-semibold text-[#191919]">Browse local shops near you</p>
        </div>
        <NuxtLink to="/notifications" class="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center">
          <UIcon name="i-lucide-bell" class="w-5 h-5 text-[#191919]" />
        </NuxtLink>
      </div>
      <button class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-3 w-full text-left">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696]" />
        <span class="text-sm text-[#969696]">Search shops, groceries</span>
      </button>
    </div>

    <!-- Category pills -->
    <div class="flex gap-2 overflow-x-auto scrollbar-none px-4 pt-4 pb-1">
      <button
        v-for="cat in shopCategories"
        :key="cat"
        class="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors"
        :class="selectedCat === cat
          ? 'bg-brand-500 text-white border-brand-500'
          : 'bg-white text-[#969696] border-[#e5e5e5]'"
        @click="selectedCat = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="px-4 pt-4 space-y-3">
      <!-- Loading -->
      <template v-if="pending">
        <USkeleton v-for="i in 4" :key="i" class="h-[220px] rounded-2xl" />
      </template>

      <!-- Empty -->
      <div v-else-if="!stores.length" class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mb-5">
          <UIcon name="i-lucide-shopping-bag" class="w-10 h-10 text-brand-500" />
        </div>
        <h2 class="text-xl font-bold text-[#191919] mb-2">No shops found</h2>
        <p class="text-sm text-[#969696] max-w-[260px]">We're partnering with local shops near you. Check back soon!</p>
      </div>

      <!-- Store cards -->
      <NuxtLink
        v-for="store in stores"
        :key="store.id"
        :to="`/restaurant/${store.id}`"
        class="block bg-white rounded-2xl overflow-hidden shadow-sm"
      >
        <div class="w-full h-[168px] bg-blue-50 relative flex items-center justify-center">
          <img v-if="store.image_url" :src="store.image_url" class="w-full h-full object-cover" />
          <UIcon v-else name="i-lucide-shopping-bag" class="w-12 h-12 text-blue-400" />
          <div v-if="!store.is_open" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl">
            <span class="bg-white/90 text-[#191919] text-xs font-semibold px-3 py-1.5 rounded-full">Closed</span>
          </div>
        </div>
        <div class="px-3 py-3">
          <div class="flex items-start justify-between gap-2">
            <p class="text-sm font-semibold text-[#191919] truncate">{{ store.name }}</p>
            <div class="flex items-center gap-0.5 shrink-0">
              <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-[#f8cc6b] fill-[#f8cc6b]" />
              <span class="text-xs text-[#969696]">{{ store.rating > 0 ? store.rating.toFixed(1) : '4.5' }}</span>
            </div>
          </div>
          <p class="text-[10px] text-[#969696] mt-0.5 truncate">{{ store.address }}</p>
          <div class="flex items-center gap-3 mt-1.5">
            <div class="flex items-center gap-1 text-[10px] text-[#969696]">
              <UIcon name="i-lucide-clock" class="w-3 h-3" />
              {{ store.average_prep_time_minutes ?? 15 }} Mins
            </div>
            <div class="flex items-center gap-1 text-[10px] text-[#969696]">
              <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
              {{ store.delivery_radius_km ?? 5 }} KM
            </div>
            <div class="flex items-center gap-1 text-[10px] text-[#969696]">
              <UIcon name="i-lucide-bike" class="w-3 h-3" />
              ₦500
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()

const shopCategories = ['All', 'Fresh Produce', 'Dairy & Eggs', 'Beverages', 'Household Items', 'Snacks & Confectionery']
const selectedCat = ref('All')

const { data, pending } = await useAsyncData('shops', () => api.getShops() as any, { server: false })
const stores = computed<any[]>(() => (data.value as any)?.data ?? [])

useSeoMeta({ title: 'Shops — NearbyMe' })
</script>
