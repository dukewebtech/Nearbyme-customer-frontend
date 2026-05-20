<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <div v-if="pending" class="flex justify-center pt-20">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 text-brand-500 animate-spin" />
    </div>

    <template v-else-if="restaurant">
      <!-- Hero image -->
      <div class="relative h-36 bg-[#f5e9e7]">
        <img v-if="restaurant.image_url" :src="restaurant.image_url" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <!-- Back + actions -->
        <div class="absolute top-12 left-4 right-4 flex items-center justify-between">
          <button class="w-9 h-9 rounded-full bg-[#f4f4f4] flex items-center justify-center" @click="$router.back()">
            <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
          </button>
          <div class="flex gap-2">
            <button class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <UIcon name="i-lucide-heart" class="w-4 h-4 text-[#969696]" />
            </button>
            <button class="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <UIcon name="i-lucide-share-2" class="w-4 h-4 text-[#969696]" />
            </button>
          </div>
        </div>

        <!-- Restaurant name overlay -->
        <div class="absolute bottom-3 left-4">
          <h1 class="text-2xl font-semibold text-white">{{ restaurant.name }}</h1>
        </div>
      </div>

      <!-- Info strip -->
      <div class="bg-white px-4 py-3 flex items-center gap-4">
        <div class="flex items-center gap-1 text-xs text-[#1e1e1e] bg-[#fdefec] rounded-lg px-2 py-1">
          <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 text-brand-500" />
          {{ restaurant.average_prep_time_minutes ?? 30 }} Mins
        </div>
        <div class="flex items-center gap-1 text-xs text-[#1e1e1e] bg-[#fdefec] rounded-lg px-2 py-1">
          <UIcon name="i-lucide-bike" class="w-3.5 h-3.5 text-brand-500" />
          ₦500
        </div>
        <div class="flex items-center gap-1 text-xs text-[#1e1e1e]">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-[#f8cc6b] fill-[#f8cc6b]" />
          {{ restaurant.rating ?? '5.0' }}
        </div>
        <span v-if="!restaurant.is_open" class="ml-auto text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-full">Closed</span>
      </div>

      <!-- Promo banners -->
      <div v-if="banners.length" class="overflow-x-auto scrollbar-none px-4 pt-3">
        <div class="flex gap-3" :style="`width: ${banners.length * 280 + 16}px`">
          <div
            v-for="banner in banners"
            :key="banner.id"
            class="w-64 shrink-0 h-24 rounded-2xl overflow-hidden relative"
          >
            <img v-if="banner.image_url" :src="banner.image_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full bg-gradient-to-r from-brand-500 to-orange-400 flex items-center px-4">
              <div>
                <p class="text-white text-xs font-semibold">{{ banner.title }}</p>
                <p v-if="banner.subtitle" class="text-white/80 text-[10px] mt-0.5">{{ banner.subtitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search in restaurant -->
      <div class="px-4 pt-3">
        <div class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-2.5">
          <UIcon name="i-lucide-search" class="w-4 h-4 text-[#97898b]" />
          <input v-model="menuSearch" type="text" :placeholder="`Search ${restaurant.name}`"
            class="flex-1 bg-transparent text-sm placeholder:text-[#97898b] outline-none" />
        </div>
      </div>

      <!-- Category pills -->
      <div v-if="categories.length" class="flex gap-2 overflow-x-auto scrollbar-none px-4 pt-3 pb-1">
        <button
          class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="!activeCategory ? 'bg-brand-500 text-white' : 'bg-[#f0f0f0] text-[#1e1e1e]'"
          @click="activeCategory = null"
        >All</button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          :class="activeCategory === cat.id ? 'bg-brand-500 text-white' : 'bg-[#f0f0f0] text-[#1e1e1e]'"
          @click="activeCategory = cat.id"
        >{{ cat.name }}</button>
      </div>

      <!-- Menu items -->
      <div class="px-4 pt-3 space-y-3">
        <div v-if="itemsLoading" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl" />
        </div>
        <div v-else-if="filteredItems.length" class="space-y-3">
          <MenuItemCard
            v-for="item in filteredItems"
            :key="item.id"
            :item="item"
            @open="openSheet(item)"
            @add="openSheet(item)"
          />
        </div>
        <div v-else class="py-10 text-center text-[#969696] text-sm">
          No items found
        </div>
      </div>
    </template>

    <!-- Cart checkout bar -->
    <Transition name="slide-up">
      <div v-if="cartCount > 0" class="fixed bottom-[72px] left-0 right-0 px-4 max-w-[390px] mx-auto z-50 pb-2">
        <NuxtLink
          to="/cart"
          class="flex items-center justify-center bg-brand-500 rounded-full py-4 shadow-xl"
        >
          <span class="text-white text-base font-semibold">
            Proceed ₦{{ cartSubtotal.toLocaleString('en-NG') }} to Checkout
          </span>
        </NuxtLink>
      </div>
    </Transition>

    <!-- Menu item detail sheet -->
    <MenuItemSheet
      v-model="sheetOpen"
      :item="sheetItem ?? {}"
      :variants="sheetVariants"
    />

    <!-- Vendor Closed modal -->
    <UModal v-model:open="closedModal">
      <template #content>
        <div class="p-6 text-center">
          <div class="w-16 h-16 rounded-full bg-[#ffe6e6] flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-store-x" class="w-8 h-8 text-red-500" />
          </div>
          <p class="text-base font-bold text-[#1e1e1e] mb-1">Vendor Currently Closed</p>
          <p class="text-sm text-[#969696] mb-6 leading-relaxed">
            {{ restaurant?.name }} is not accepting orders right now.
            Check back later or browse other open restaurants.
          </p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#1e1e1e]"
              @click="closedModal = false"
            >Stay Here</button>
            <button
              class="flex-1 py-3 rounded-full bg-brand-500 text-white text-sm font-semibold"
              @click="$router.back()"
            >Explore Others</button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const cartStore = useCartStore()

const restaurantId = route.params.id as string

onMounted(() => cartStore.fetchCart())

const menuSearch    = ref('')
const activeCategory = ref<string | null>(null)
const categories    = ref<any[]>([])
const menuItems     = ref<any[]>([])
const banners       = ref<any[]>([])
const itemsLoading  = ref(false)
const closedModal   = ref(false)

// Sheet state
const sheetOpen     = ref(false)
const sheetItem     = ref<any>(null)
const sheetVariants = ref<any[]>([])
const sheetLoading  = ref(false)

const cartCount = computed(() => cartStore.itemCount)
const cartSubtotal = computed(() => cartStore.subtotal)

const { data, pending } = await useAsyncData(`restaurant-${restaurantId}`, () => api.getRestaurant(restaurantId) as any, { server: false })
const restaurant = computed(() => (data.value as any)?.data)

const filteredItems = computed(() => {
  let items = menuItems.value.filter((i: any) => i.is_available !== false)
  if (activeCategory.value) items = items.filter((i: any) => i.category_id === activeCategory.value)
  if (menuSearch.value) {
    const q = menuSearch.value.toLowerCase()
    items = items.filter((i: any) => i.name?.toLowerCase().includes(q))
  }
  return items
})

watch(() => restaurant.value, async (r) => {
  if (!r) return
  // Show closed modal if vendor is not open
  if (r.is_open === false) closedModal.value = true
  itemsLoading.value = true
  try {
    const [catRes, itemRes, bannerRes] = await Promise.all([
      api.getCategories(restaurantId) as any,
      api.getMenuItems(restaurantId) as any,
      api.getRestaurantBanners(restaurantId).catch(() => ({ data: [] })) as any,
    ])
    categories.value = catRes.data ?? []
    menuItems.value  = itemRes.data ?? []
    banners.value    = bannerRes.data ?? []
  } finally { itemsLoading.value = false }
}, { immediate: true })

async function openSheet(item: any) {
  sheetItem.value = item
  sheetVariants.value = []
  sheetOpen.value = true
  // Fetch full item detail (includes variants) in background
  sheetLoading.value = true
  try {
    const res = await api.getMenuItem(item.id) as any
    const full = res.data
    if (full) {
      sheetItem.value = full
      sheetVariants.value = full.menu_item_variants ?? []
    }
  } catch { /* fallback to basic item, no variants */ }
  finally { sheetLoading.value = false }
}

useSeoMeta({ title: `${restaurant.value?.name ?? 'Restaurant'} — NearbyMe` })
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(8px); }

.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.2s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0; }
</style>
