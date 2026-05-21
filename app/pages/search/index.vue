<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header search bar -->
    <div class="bg-white px-4 pt-12 pb-4">
      <div class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-3 border-2 border-brand-100">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696] shrink-0" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search food, vendor"
          class="flex-1 bg-transparent text-sm text-[#191919] placeholder:text-[#97898b] outline-none"
          @input="onInput"
        />
        <button v-if="query" @click="clearQuery">
          <UIcon name="i-lucide-x" class="w-4 h-4 text-[#969696]" />
        </button>
      </div>
    </div>

    <!-- Empty state: recent searches -->
    <div v-if="!query" class="px-4 pt-4">
      <div class="flex items-center justify-between mb-3">
        <p class="text-sm font-semibold text-[#1e1e1e]">Recently Searched</p>
        <button v-if="recent.length" class="text-xs text-brand-500 font-medium" @click="clearHistory">Clear All</button>
      </div>
      <div v-if="recent.length" class="flex flex-wrap gap-2">
        <div
          v-for="item in recent"
          :key="item"
          class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5"
        >
          <button class="text-sm font-medium text-[#1e1e1e]" @click="setQuery(item)">{{ item }}</button>
          <button @click="removeRecent(item)">
            <UIcon name="i-lucide-x" class="w-3 h-3 text-[#969696]" />
          </button>
        </div>
      </div>
      <div v-else class="py-14 flex flex-col items-center text-center">
        <UIcon name="i-lucide-search" class="w-12 h-12 text-gray-200 mb-3" />
        <p class="text-sm text-[#969696]">Search for food or restaurants</p>
      </div>
    </div>

    <!-- Typing: suggestions -->
    <div v-else-if="query.length >= 2 && suggestions.length && !totalCount && !searching" class="px-4 pt-2">
      <button
        v-for="s in suggestions"
        :key="s"
        class="w-full flex items-center gap-3 py-3 border-b border-gray-100 last:border-0"
        @click="setQuery(s)"
      >
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696] shrink-0" />
        <span class="text-sm text-[#1e1e1e]">{{ s }}</span>
      </button>
    </div>

    <!-- Results -->
    <div v-else class="px-4 pt-4">
      <!-- Filter pills -->
      <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
        <button
          v-for="f in filters"
          :key="f"
          class="shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors"
          :class="activeFilter === f ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-[#1e1e1e] border-gray-200'"
          @click="activeFilter = f"
        >{{ f }}</button>
      </div>

      <!-- Result tabs -->
      <div class="flex gap-3 mb-4 border-b border-gray-100 pb-0">
        <button
          v-for="tab in resultTabs"
          :key="tab"
          class="pb-2 text-sm font-semibold border-b-2 transition-colors"
          :class="activeResultTab === tab ? 'border-brand-500 text-brand-500' : 'border-transparent text-[#969696]'"
          @click="activeResultTab = tab"
        >{{ tab }}</button>
      </div>

      <!-- Loading -->
      <div v-if="searching" class="space-y-3">
        <USkeleton v-for="i in 4" :key="i" class="h-[220px] rounded-2xl" />
      </div>

      <!-- Results content -->
      <template v-else-if="totalCount">
        <p class="text-xs text-[#969696] mb-3">Showing {{ totalCount }} results for "{{ query }}"</p>

        <!-- Vendors -->
        <div v-if="(activeResultTab === 'All' || activeResultTab === 'Vendors') && filteredVendors.length" class="space-y-3 mb-4">
          <p v-if="activeResultTab === 'All' && filteredMeals.length" class="text-xs font-semibold text-[#969696] uppercase tracking-wide">Restaurants</p>
          <RestaurantCard v-for="r in filteredVendors" :key="r.id" :restaurant="r" />
        </div>

        <!-- Meals -->
        <div v-if="(activeResultTab === 'All' || activeResultTab === 'Meals') && filteredMeals.length" class="space-y-2">
          <p v-if="activeResultTab === 'All' && filteredVendors.length" class="text-xs font-semibold text-[#969696] uppercase tracking-wide mb-2">Meals</p>
          <NuxtLink
            v-for="m in filteredMeals"
            :key="m.id"
            :to="`/restaurant/${m.restaurants?.id}`"
            class="flex items-center gap-3 bg-white rounded-2xl p-3"
          >
            <div class="w-16 h-16 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
              <img v-if="m.image_url" :src="m.image_url" class="w-full h-full object-cover" />
              <UIcon v-else name="i-lucide-utensils" class="w-6 h-6 text-brand-300" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ m.name }}</p>
              <p class="text-xs text-[#969696] truncate mt-0.5">{{ m.restaurants?.name }}</p>
              <p class="text-sm font-bold text-brand-500 mt-1">₦{{ Number(m.price ?? 0).toLocaleString('en-NG') }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-[#969696] shrink-0" />
          </NuxtLink>
        </div>
      </template>

      <!-- No results -->
      <div v-else class="py-14 flex flex-col items-center text-center">
        <UIcon name="i-lucide-search-x" class="w-12 h-12 text-gray-300 mb-3" />
        <p class="text-base font-semibold text-[#191919]">No results found</p>
        <p class="text-sm text-[#969696] mt-1">Try a different search term</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route  = useRoute()
const api    = useApi()

const query           = ref((route.query.q as string) ?? '')
const vendors         = ref<any[]>([])
const meals           = ref<any[]>([])
const suggestions     = ref<string[]>([])
const searching       = ref(false)
const activeFilter    = ref('Ratings')
const activeResultTab = ref('All')
const filters         = ['Ratings', 'Closest to you', 'Delivery fee']
const resultTabs      = ['All', 'Meals', 'Vendors']
const totalCount      = computed(() => vendors.value.length + meals.value.length)

// Recent searches from localStorage
const recent = ref<string[]>(
  import.meta.client ? JSON.parse(localStorage.getItem('searchHistory') ?? '[]') : []
)

watch(recent, (v) => {
  if (import.meta.client) localStorage.setItem('searchHistory', JSON.stringify(v))
}, { deep: true })

let debounce: ReturnType<typeof setTimeout>
let suggestDebounce: ReturnType<typeof setTimeout>

function onInput() {
  clearTimeout(debounce)
  clearTimeout(suggestDebounce)
  if (!query.value.trim()) { vendors.value = []; meals.value = []; suggestions.value = []; return }

  // Autocomplete
  suggestDebounce = setTimeout(async () => {
    try {
      const res = await api.getSearchSuggestions(query.value) as any
      suggestions.value = res.data ?? []
    } catch { suggestions.value = [] }
  }, 200)

  // Full search
  debounce = setTimeout(doSearch, 400)
}

async function doSearch() {
  if (!query.value.trim()) return
  searching.value = true
  suggestions.value = []
  try {
    const res = await api.search({ q: query.value, type: 'all' }) as any
    // API returns { data: { vendors: [], meals: [] } }
    const d = res.data ?? {}
    vendors.value = Array.isArray(d.vendors) ? d.vendors : (Array.isArray(d) ? d : [])
    meals.value   = Array.isArray(d.meals)   ? d.meals   : []
    if (!recent.value.includes(query.value)) {
      recent.value = [query.value, ...recent.value.slice(0, 4)]
    }
  } catch {
    // Fallback: load all restaurants and filter by name
    try {
      const r = await api.getRestaurants() as any
      const q = query.value.toLowerCase()
      vendors.value = (r.data ?? []).filter((x: any) => x.name?.toLowerCase().includes(q))
      meals.value   = []
    } catch { vendors.value = []; meals.value = [] }
  } finally { searching.value = false }
}

const filteredVendors = computed(() => {
  let list = [...vendors.value]
  if (activeFilter.value === 'Ratings')      list = list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
  if (activeFilter.value === 'Delivery fee') list = list.sort((a, b) => (a.delivery_fee ?? 0) - (b.delivery_fee ?? 0))
  return list
})

const filteredMeals = computed(() => [...meals.value])

const hasResults = computed(() => {
  if (activeResultTab.value === 'Vendors') return filteredVendors.value.length > 0
  if (activeResultTab.value === 'Meals')   return filteredMeals.value.length > 0
  return filteredVendors.value.length > 0 || filteredMeals.value.length > 0
})

function setQuery(v: string) { query.value = v; doSearch() }
function clearQuery() { query.value = ''; vendors.value = []; meals.value = []; suggestions.value = [] }
function removeRecent(v: string) { recent.value = recent.value.filter(r => r !== v) }

async function clearHistory() {
  recent.value = []
  try { await api.clearSearchHistory() } catch { /* ok */ }
}

if (query.value) doSearch()

useSeoMeta({ title: 'Search — NearbyMe' })
</script>
