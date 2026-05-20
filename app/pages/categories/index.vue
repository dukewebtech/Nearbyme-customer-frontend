<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-[#191919]">All Categories</h1>
        <button class="flex items-center gap-1.5 text-sm font-semibold text-brand-500" @click="showSort = true">
          <UIcon name="i-lucide-sliders-horizontal" class="w-4 h-4" />
          Sort
        </button>
      </div>

      <!-- Store type tabs -->
      <div class="flex gap-2 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in storeTabs"
          :key="tab.key"
          class="shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-colors"
          :class="activeStore === tab.key ? 'bg-brand-500 text-white' : 'bg-[#f0f0f0] text-[#1e1e1e]'"
          @click="activeStore = tab.key"
        >{{ tab.label }}</button>
      </div>
    </div>

    <!-- Loading skeletons -->
    <div v-if="pending" class="px-4 pt-4 grid grid-cols-3 gap-3">
      <USkeleton v-for="i in 9" :key="i" class="h-24 rounded-2xl" />
    </div>

    <template v-else>
      <!-- Recommended section -->
      <div v-if="recommended.length" class="px-4 pt-4">
        <p class="text-sm font-bold text-[#1e1e1e] mb-3">Recommended</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="cat in recommended"
            :key="cat.id"
            class="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 text-center shadow-sm"
            @click="goToCategory(cat)"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :style="cat.color ? `background:${cat.color}20` : ''"
              :class="!cat.color ? 'bg-[#fdefec]' : ''"
            >
              <span v-if="cat.emoji">{{ cat.emoji }}</span>
              <img v-else-if="cat.image_url" :src="cat.image_url" class="w-8 h-8 object-contain" />
              <UIcon v-else name="i-lucide-utensils" class="w-6 h-6 text-brand-500" />
            </div>
            <p class="text-xs font-semibold text-[#1e1e1e] leading-tight">{{ cat.name }}</p>
          </button>
        </div>
      </div>

      <!-- Explore all section -->
      <div class="px-4 pt-5">
        <p class="text-sm font-bold text-[#1e1e1e] mb-3">Explore All</p>
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="cat in sortedCategories"
            :key="cat.id"
            class="bg-white rounded-2xl p-3 flex flex-col items-center gap-2 text-center shadow-sm"
            @click="goToCategory(cat)"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
              :style="cat.color ? `background:${cat.color}20` : ''"
              :class="!cat.color ? 'bg-[#f5f5f5]' : ''"
            >
              <span v-if="cat.emoji">{{ cat.emoji }}</span>
              <img v-else-if="cat.image_url" :src="cat.image_url" class="w-8 h-8 object-contain" />
              <UIcon v-else name="i-lucide-tag" class="w-6 h-6 text-[#969696]" />
            </div>
            <p class="text-xs font-semibold text-[#1e1e1e] leading-tight">{{ cat.name }}</p>
            <p class="text-[10px] text-[#969696]">{{ cat.restaurant_count ?? '' }}{{ cat.restaurant_count ? ' vendors' : '' }}</p>
          </button>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!sortedCategories.length && !recommended.length" class="flex flex-col items-center py-20 text-center px-4">
        <UIcon name="i-lucide-tag" class="w-12 h-12 text-gray-300 mb-3" />
        <p class="text-base font-semibold text-[#191919]">No Categories Found</p>
        <p class="text-sm text-[#969696] mt-1">Check back soon for more categories</p>
      </div>
    </template>

    <!-- Sort bottom sheet -->
    <UModal v-model:open="showSort">
      <template #content>
        <div class="p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-[#1e1e1e]">Sort By</h2>
            <button @click="showSort = false">
              <UIcon name="i-lucide-x" class="w-5 h-5 text-[#969696]" />
            </button>
          </div>
          <div class="space-y-2">
            <button
              v-for="opt in sortOptions"
              :key="opt.key"
              class="w-full flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
              @click="sortBy = opt.key; showSort = false"
            >
              <div
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                :class="sortBy === opt.key ? 'border-brand-500 bg-brand-500' : 'border-gray-300'"
              >
                <div v-if="sortBy === opt.key" class="w-2 h-2 rounded-full bg-white" />
              </div>
              <span class="text-sm font-medium text-[#1e1e1e]">{{ opt.label }}</span>
            </button>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api = useApi()

const storeTabs = [
  { key: 'restaurant', label: 'Food' },
  { key: 'pharmacy',   label: 'Pharmacy' },
  { key: 'shop',       label: 'Shop' },
]

const activeStore = ref('restaurant')
const showSort    = ref(false)
const sortBy      = ref('popular')

const sortOptions = [
  { key: 'popular',     label: 'Most Popular' },
  { key: 'az',          label: 'A → Z' },
  { key: 'vendors',     label: 'Most Vendors' },
]

const { data, pending, refresh } = await useAsyncData(
  () => `categories-${activeStore.value}`,
  () => api.getGlobalCategories(activeStore.value) as any,
  { server: false, watch: [activeStore] }
)

const categories = computed<any[]>(() => (data.value as any)?.data ?? [])

const recommended = computed(() =>
  categories.value.filter(c => c.is_featured || c.is_recommended).slice(0, 6)
)

const sortedCategories = computed(() => {
  let list = [...categories.value]
  if (sortBy.value === 'az')      list = list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  if (sortBy.value === 'vendors') list = list.sort((a, b) => (b.restaurant_count ?? 0) - (a.restaurant_count ?? 0))
  return list
})

function goToCategory(cat: any) {
  const base = activeStore.value === 'pharmacy' ? '/pharmacy' : activeStore.value === 'shop' ? '/shops' : '/'
  navigateTo({ path: base, query: { category: cat.id, name: cat.name } })
}

useSeoMeta({ title: 'Categories — NearbyMe' })
</script>
