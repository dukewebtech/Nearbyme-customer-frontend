<template>
  <div class="min-h-screen max-w-[390px] mx-auto flex flex-col overflow-hidden">
    <!-- Orange section -->
    <div class="relative bg-brand-500 flex-1 flex flex-col overflow-hidden">
      <!-- Decorative arcs -->
      <div class="absolute -left-24 top-10 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute -right-20 top-1/3 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
      <div class="absolute -left-10 bottom-0 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />

      <!-- Categories — staggered 2 · 1 · 2 · 1 -->
      <div class="relative z-10 flex-1 flex flex-col justify-center px-10 py-12 gap-6">
        <!-- Row 1 -->
        <div class="flex justify-between items-end">
          <button
            v-for="cat in rows[0]"
            :key="cat.name"
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            @click="handleSelect(cat)"
          >
            <div class="w-[110px] h-[110px] rounded-full bg-white border-4 border-rose-100 flex items-center justify-center text-5xl shadow-md">
              {{ cat.emoji }}
            </div>
            <span class="bg-white rounded-xl px-3 py-1 text-xs font-semibold text-[#191919] shadow-sm whitespace-nowrap">{{ cat.name }}</span>
          </button>
        </div>

        <!-- Row 2 -->
        <div class="flex justify-center">
          <button
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            @click="handleSelect(rows[1][0])"
          >
            <div class="w-[110px] h-[110px] rounded-full bg-white border-4 border-rose-100 flex items-center justify-center text-5xl shadow-md">
              {{ rows[1][0].emoji }}
            </div>
            <span class="bg-white rounded-xl px-3 py-1 text-xs font-semibold text-[#191919] shadow-sm whitespace-nowrap">{{ rows[1][0].name }}</span>
          </button>
        </div>

        <!-- Row 3 -->
        <div class="flex justify-between items-start">
          <button
            v-for="cat in rows[2]"
            :key="cat.name"
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            @click="handleSelect(cat)"
          >
            <div class="w-[110px] h-[110px] rounded-full bg-white border-4 border-rose-100 flex items-center justify-center text-5xl shadow-md">
              {{ cat.emoji }}
            </div>
            <span class="bg-white rounded-xl px-3 py-1 text-xs font-semibold text-[#191919] shadow-sm whitespace-nowrap">{{ cat.name }}</span>
          </button>
        </div>

        <!-- Row 4 -->
        <div class="flex justify-center">
          <button
            class="flex flex-col items-center gap-2 active:scale-95 transition-transform"
            @click="handleSelect(rows[3][0])"
          >
            <div class="w-[110px] h-[110px] rounded-full bg-white border-4 border-rose-100 flex items-center justify-center text-5xl shadow-md">
              {{ rows[3][0].emoji }}
            </div>
            <span class="bg-white rounded-xl px-3 py-1 text-xs font-semibold text-[#191919] shadow-sm whitespace-nowrap">{{ rows[3][0].name }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom white section -->
    <div class="bg-white px-6 pt-7 pb-10 flex-shrink-0 text-center">
      <h2 class="text-[22px] font-bold text-[#191919]">Choose a category to begin</h2>
      <div class="w-10 h-1 bg-[#191919] rounded-full mx-auto mt-6" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const categories = [
  { name: 'Healthy Meal',     emoji: '🥗', route: '/' },
  { name: 'Food In Bowls',    emoji: '🥣', route: '/' },
  { name: 'Shops',            emoji: '🛍️', route: '/shops' },
  { name: 'Food',             emoji: '🍔', route: '/' },
  { name: 'Groceries',        emoji: '🛒', route: '/shops' },
  { name: 'Pharmaceuticals',  emoji: '💊', route: '/pharmacy' },
]

// Split into staggered rows: 2 · 1 · 2 · 1
const rows = [
  categories.slice(0, 2),
  categories.slice(2, 3),
  categories.slice(3, 5),
  categories.slice(5, 6),
]

function handleSelect(cat: typeof categories[0]) {
  if (import.meta.client) {
    localStorage.setItem('selectedCategory', cat.name)
  }
  navigateTo(cat.route)
}

useSeoMeta({ title: 'What are you looking for? — NearbyMe' })
</script>
