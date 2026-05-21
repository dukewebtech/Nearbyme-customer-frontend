<template>
  <div class="pb-[72px] min-h-screen bg-white">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-[#191919]">Favorites</h1>
      <span v-if="totalCount" class="text-sm font-semibold text-[#969696]">{{ totalCount }} Saved</span>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 px-4 pb-4">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
        :class="activeTab === tab ? 'bg-brand-500 text-white' : 'bg-[#f0f0f0] text-[#1e1e1e]'"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="px-4 grid grid-cols-2 gap-3">
      <USkeleton v-for="i in 6" :key="i" class="h-52 rounded-2xl" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!totalCount" class="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[#fce7e3] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-heart" class="w-10 h-10 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">No Favorites Yet</p>
      <p class="text-sm text-[#969696] mt-1 mb-6">Tap the heart icon on any restaurant or meal to save it here.</p>
      <NuxtLink to="/" class="bg-brand-500 text-white text-base font-semibold px-8 py-3.5 rounded-full">
        Explore Categories
      </NuxtLink>
    </div>

    <!-- Content -->
    <div v-else class="px-4 space-y-5">
      <!-- Meals section -->
      <div v-if="(activeTab === 'All' || activeTab === 'Meals') && mealFavs.length">
        <p v-if="activeTab === 'All'" class="text-sm font-semibold text-[#969696] uppercase tracking-wide mb-3">Meals</p>
        <div class="grid grid-cols-2 gap-3">
          <div
            v-for="fav in mealFavs"
            :key="fav.id"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            <div class="h-32 bg-[#f5e9e7] relative overflow-hidden">
              <img v-if="fav.menu_items?.image_url" :src="fav.menu_items.image_url" class="w-full h-full object-cover" />
              <UIcon v-else name="i-lucide-utensils" class="absolute inset-0 m-auto w-10 h-10 text-brand-300" />
              <button class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow" @click="removeFav(fav.id)">
                <UIcon name="i-lucide-heart" class="w-4 h-4 text-brand-500 fav-active" />
              </button>
            </div>
            <div class="p-2.5">
              <p class="text-xs font-semibold text-[#1e1e1e] truncate">{{ fav.menu_items?.name ?? 'Item' }}</p>
              <div class="flex items-center gap-1 mt-1">
                <div class="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
                  <UIcon name="i-lucide-store" class="w-2.5 h-2.5 text-brand-500" />
                </div>
                <p class="text-[10px] text-[#969696] truncate">{{ fav.menu_items?.restaurants?.name ?? '' }}</p>
              </div>
              <p class="text-xs font-bold text-brand-500 mt-1">₦{{ Number(fav.menu_items?.price ?? 0).toLocaleString('en-NG') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Vendors section -->
      <div v-if="(activeTab === 'All' || activeTab === 'Vendors') && vendorFavs.length">
        <p v-if="activeTab === 'All'" class="text-sm font-semibold text-[#969696] uppercase tracking-wide mb-3">Vendors</p>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink
            v-for="fav in vendorFavs"
            :key="fav.id"
            :to="`/restaurant/${fav.restaurants?.id}`"
            class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 block"
          >
            <div class="h-24 bg-[#f5e9e7] relative overflow-hidden">
              <img v-if="fav.restaurants?.image_url" :src="fav.restaurants.image_url" class="w-full h-full object-cover" />
              <UIcon v-else name="i-lucide-store" class="absolute inset-0 m-auto w-8 h-8 text-brand-300" />
              <button class="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow" @click.stop.prevent="removeFav(fav.id)">
                <UIcon name="i-lucide-heart" class="w-3.5 h-3.5 text-brand-500 fav-active" />
              </button>
            </div>
            <div class="p-2.5">
              <p class="text-xs font-semibold text-[#1e1e1e] truncate">{{ fav.restaurants?.name ?? 'Restaurant' }}</p>
              <div class="flex items-center gap-2 mt-1 text-[10px] text-[#969696]">
                <span>{{ fav.restaurants?.average_prep_time_minutes ?? 30 }}-{{ (fav.restaurants?.average_prep_time_minutes ?? 30) + 10 }} Mins</span>
                <span>·</span>
                <span>₦500</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api      = useApi()
const tabs     = ['All', 'Meals', 'Vendors']
const activeTab = ref('All')

const { data, pending, refresh } = await useAsyncData('favorites', () => api.getFavorites() as any, { server: false })
const favs = computed<any[]>(() => (data.value as any)?.data ?? [])

const mealFavs   = computed(() => favs.value.filter(f => f.type === 'meal'))
const vendorFavs = computed(() => favs.value.filter(f => f.type === 'vendor'))
const totalCount = computed(() => favs.value.length)

async function removeFav(id: string) {
  try {
    await api.removeFavorite(id)
    await refresh()
  } catch { /* silent */ }
}

useSeoMeta({ title: 'Favorites — NearbyMe' })
</script>

<style scoped>
:deep(.fav-active path) {
  fill: #E85D2F;
  stroke: #E85D2F;
}
</style>
