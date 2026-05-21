<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Top bar -->
    <div class="bg-white px-4 pt-12 pb-4">
      <div class="flex items-center justify-between mb-4">
        <div>
          <p class="text-sm text-[#969696]">Hello {{ firstName }} 👋</p>
          <button class="flex items-center gap-1 mt-0.5" @click="navigateTo('/addresses')">
            <UIcon name="i-lucide-map-pin" class="w-4 h-4 text-brand-500 shrink-0" />
            <p class="text-base font-medium text-[#191919] truncate max-w-[220px]">{{ location }}</p>
            <UIcon name="i-lucide-chevron-down" class="w-4 h-4 text-[#969696]" />
          </button>
        </div>
        <NuxtLink to="/notifications" class="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center relative">
          <UIcon name="i-lucide-bell" class="w-5 h-5 text-[#191919]" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </NuxtLink>
      </div>

      <!-- Search bar -->
      <NuxtLink to="/search" class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-3">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696]" />
        <span class="text-sm text-[#969696]">Search food, Restaurant</span>
      </NuxtLink>
    </div>

    <div class="px-4 pt-4 space-y-6">
      <!-- Categories -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-base font-semibold text-[#191919]">Categories</p>
          <NuxtLink to="/categories" class="text-xs text-brand-500 font-medium">See all</NuxtLink>
        </div>
        <div v-if="catPending" class="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <div v-for="i in 6" :key="i" class="flex flex-col items-center gap-1.5 shrink-0">
            <USkeleton class="w-14 h-14 rounded-2xl" />
            <USkeleton class="w-12 h-3 rounded" />
          </div>
        </div>
        <div v-else class="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <button
            v-for="cat in categories"
            :key="cat.id ?? cat.name"
            class="flex flex-col items-center gap-1.5 shrink-0"
            @click="searchByCategory(cat.name)"
          >
            <div class="w-14 h-14 rounded-2xl bg-[#f5e9e7] flex items-center justify-center overflow-hidden text-2xl">
              <img v-if="cat.image_url" :src="cat.image_url" class="w-full h-full object-cover" />
              <span v-else>{{ emojiFor(cat.name) }}</span>
            </div>
            <p class="text-[10px] text-[#191919] font-medium text-center max-w-[56px] leading-tight">{{ cat.name }}</p>
          </button>
        </div>
      </div>

      <!-- Featured Dishes -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-base font-semibold text-[#191919]">Featured Dishes</p>
        </div>
        <div v-if="pending" class="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <USkeleton v-for="i in 3" :key="i" class="w-40 h-48 rounded-2xl shrink-0" />
        </div>
        <div v-else class="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          <NuxtLink
            v-for="r in restaurants.slice(0, 5)"
            :key="r.id"
            :to="`/restaurant/${r.id}`"
            class="shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            <div class="w-full h-28 bg-[#f5e9e7] flex items-center justify-center">
              <UIcon v-if="!r.image_url" name="i-lucide-utensils" class="w-10 h-10 text-brand-300" />
              <img v-else :src="r.image_url" class="w-full h-full object-cover" />
            </div>
            <div class="p-2.5">
              <p class="text-xs font-semibold text-[#191919] truncate">{{ r.name }}</p>
              <p class="text-[10px] text-[#969696] truncate mt-0.5">{{ r.address }}</p>
              <div class="flex items-center gap-1 mt-1">
                <UIcon name="i-lucide-star" class="w-3 h-3 text-[#f8cc6b] fill-[#f8cc6b]" />
                <span class="text-[10px] text-[#969696]">{{ r.rating ?? '4.5' }}</span>
                <span class="text-[10px] text-[#969696]">· {{ r.average_prep_time_minutes ?? 30 }} Mins</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Restaurants to Explore -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <p class="text-base font-semibold text-[#191919]">Restaurant To Explore</p>
        </div>
        <div v-if="pending" class="space-y-3">
          <USkeleton v-for="i in 3" :key="i" class="h-[220px] rounded-2xl" />
        </div>
        <div v-else-if="restaurants.length" class="space-y-3">
          <RestaurantCard
            v-for="r in restaurants"
            :key="r.id"
            :restaurant="r"
            :is-favorited="favMap[r.id]?.favorited ?? false"
            :favorite-id="favMap[r.id]?.favId ?? null"
            @favorite-changed="onFavoriteChanged"
          />
        </div>
        <div v-else class="bg-white rounded-2xl py-12 flex flex-col items-center text-center">
          <UIcon name="i-lucide-store" class="w-10 h-10 text-gray-300 mb-2" />
          <p class="text-sm font-semibold text-[#191919]">No restaurants yet</p>
          <p class="text-xs text-[#969696] mt-1">Check back soon!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api  = useApi()
const auth = useAuthStore()

// ── Name ──────────────────────────────────────────────────────────────────────
const firstName = computed(() => {
  const u = auth.user as any
  return u?.user_metadata?.first_name ?? u?.first_name ?? u?.email?.split('@')[0] ?? 'there'
})

// ── Location (reverse geocode stored lat/lng via Nominatim) ───────────────────
const location = ref('Lagos, Nigeria')

async function resolveLocation() {
  if (!import.meta.client) return
  const cached = localStorage.getItem('userAddress')
  if (cached) { location.value = cached; return }

  const lat = localStorage.getItem('userLat')
  const lng = localStorage.getItem('userLng')
  if (!lat || !lng) return

  try {
    const res = await $fetch<any>(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const a = res.address ?? {}
    const label = [
      a.suburb ?? a.neighbourhood ?? a.quarter ?? a.village ?? a.town,
      a.city ?? a.city_district ?? a.county ?? a.state,
    ].filter(Boolean).join(', ')

    if (label) {
      location.value = label
      localStorage.setItem('userAddress', label)
    }
  } catch { /* keep default */ }
}

// ── Categories (from API with emoji fallback) ─────────────────────────────────
const emojiMap: Record<string, string> = {
  'fast food': '🍔', 'burger': '🍔', 'burgers': '🍔',
  'pizza': '🍕',
  'pasta': '🍝', 'noodles': '🍜',
  'rice': '🍚', 'local': '🍛', 'local dishes': '🍛', 'nigerian': '🍛',
  'chicken': '🍗', 'grills': '🥩', 'grill': '🥩', 'bbq': '🥩',
  'seafood': '🦐', 'fish': '🐟',
  'shawarma': '🌯', 'wraps': '🌯',
  'drinks': '🥤', 'beverages': '🥤', 'smoothies': '🥤', 'juice': '🍊',
  'snacks': '🍿', 'desserts': '🍰', 'cakes': '🎂', 'pastry': '🥐',
  'breakfast': '🍳', 'soups': '🍲', 'soup': '🍲',
  'salads': '🥗', 'healthy': '🥗', 'vegan': '🥦',
  'sushi': '🍣', 'chinese': '🥡', 'indian': '🍛',
  'ice cream': '🍦', 'gelato': '🍧',
  'sandwiches': '🥪', 'bread': '🍞',
}

function emojiFor(name: string): string {
  const key = (name ?? '').toLowerCase()
  for (const [k, v] of Object.entries(emojiMap)) {
    if (key.includes(k)) return v
  }
  return '🍽️'
}

const { data: catData, pending: catPending } = await useAsyncData(
  'home-categories',
  () => api.getGlobalCategories('restaurant') as any,
  { server: false }
)
const categories = computed<any[]>(() => (catData.value as any)?.data ?? [])

// ── Restaurants ───────────────────────────────────────────────────────────────
const { data, pending } = await useAsyncData(
  'home-restaurants',
  () => api.getRestaurants() as any,
  { server: false }
)
const restaurants = computed<any[]>(() => (data.value as any)?.data ?? [])

// ── Favorites map { restaurantId → { favorited, favId } } ────────────────────
const favMap = reactive<Record<string, { favorited: boolean; favId: string | null }>>({})

async function loadFavorites() {
  try {
    const res = await api.getFavorites() as any
    const list: any[] = res.data ?? []
    list
      .filter(f => f.type === 'vendor' && f.restaurant_id)
      .forEach(f => {
        favMap[f.restaurant_id] = { favorited: true, favId: f.id }
      })
  } catch { /* silent — favorites just won't be pre-checked */ }
}

function onFavoriteChanged(restaurantId: string, nowFavorited: boolean, favId: string | null) {
  favMap[restaurantId] = { favorited: nowFavorited, favId }
}

// ── Init ──────────────────────────────────────────────────────────────────────
onMounted(() => {
  resolveLocation()
  loadFavorites()
})

function searchByCategory(name: string) {
  navigateTo(`/search?q=${encodeURIComponent(name)}`)
}

useSeoMeta({ title: 'Home — NearbyMe' })
</script>
