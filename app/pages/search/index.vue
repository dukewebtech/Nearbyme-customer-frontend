<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4">
      <h1 class="text-2xl font-semibold text-[#191919] mb-4">Search</h1>
      <div class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-4 py-3">
        <UIcon name="i-lucide-search" class="w-4 h-4 text-[#969696] shrink-0" />
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Search food, vendor"
          class="flex-1 bg-transparent text-sm text-[#191919] placeholder:text-[#97898b] outline-none"
          @input="onInput"
        />
        <button v-if="query" @click="query = ''; results = []">
          <UIcon name="i-lucide-x" class="w-4 h-4 text-[#969696]" />
        </button>
      </div>
    </div>

    <div class="px-4 pt-4">
      <!-- Recent searches (empty query) -->
      <div v-if="!query">
        <div class="flex items-center justify-between mb-3">
          <p class="text-sm font-medium text-[#1e1e1e]">Recently Searched</p>
          <button v-if="recent.length" class="text-xs text-brand-500 font-medium" @click="recent = []">Clear All</button>
        </div>
        <div v-if="recent.length" class="space-y-3">
          <button
            v-for="item in recent"
            :key="item"
            class="flex items-center justify-between w-full py-2"
            @click="query = item; search()"
          >
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide-clock" class="w-4 h-4 text-[#969696]" />
              <span class="text-sm font-medium text-[#1e1e1e]">{{ item }}</span>
            </div>
            <UIcon name="i-lucide-arrow-up-left" class="w-4 h-4 text-[#969696]" />
          </button>
        </div>
        <div v-else class="py-10 text-center">
          <UIcon name="i-lucide-search" class="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p class="text-sm text-[#969696]">Search for food or restaurants</p>
        </div>
      </div>

      <!-- Search results -->
      <div v-else>
        <div v-if="searching" class="space-y-3">
          <USkeleton v-for="i in 4" :key="i" class="h-[220px] rounded-2xl" />
        </div>

        <div v-else-if="results.length">
          <p class="text-xs text-[#969696] mb-3">{{ results.length }} result{{ results.length !== 1 ? 's' : '' }} for "{{ query }}"</p>
          <div class="space-y-3">
            <RestaurantCard v-for="r in results" :key="r.id" :restaurant="r" />
          </div>
        </div>

        <div v-else class="py-14 flex flex-col items-center text-center">
          <UIcon name="i-lucide-search-x" class="w-12 h-12 text-gray-300 mb-3" />
          <p class="text-base font-semibold text-[#191919]">No results found</p>
          <p class="text-sm text-[#969696] mt-1">Try a different search term</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()

const query = ref((route.query.q as string) ?? '')
const results = ref<any[]>([])
const searching = ref(false)
const recent = ref<string[]>(['Fried Rice', 'Coconut Rice', 'Jollof Rice'])

let debounceTimer: ReturnType<typeof setTimeout>

async function search() {
  if (!query.value.trim()) { results.value = []; return }
  searching.value = true
  try {
    const res = await api.getRestaurants() as any
    const all: any[] = res.data ?? []
    const q = query.value.toLowerCase()
    results.value = all.filter(r =>
      r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
    )
    if (!recent.value.includes(query.value)) {
      recent.value = [query.value, ...recent.value.slice(0, 4)]
    }
  } catch { results.value = [] }
  finally { searching.value = false }
}

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(search, 400)
}

if (query.value) search()

useSeoMeta({ title: 'Search — NearbyMe' })
</script>
