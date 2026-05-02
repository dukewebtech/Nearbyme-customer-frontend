<template>
  <div class="pb-[72px] min-h-screen bg-white">
    <!-- Header -->
    <div class="px-4 pt-12 pb-4">
      <h1 class="text-2xl font-semibold text-[#191919]">Favorites</h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 overflow-x-auto scrollbar-none px-4 pb-3">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === tab ? 'bg-brand-500 text-white' : 'bg-[#f0f0f0] text-[#1e1e1e]'"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <!-- Empty state (always shown for now - real favorites need a favs API) -->
    <div class="px-4 pt-4">
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div class="w-20 h-20 rounded-full bg-[#fce7e3] flex items-center justify-center mb-4">
          <UIcon name="i-lucide-heart" class="w-10 h-10 text-brand-500" />
        </div>
        <p class="text-base font-semibold text-[#191919]">No Favorites Yet</p>
        <p class="text-sm text-[#969696] mt-1 mb-6">Tap the heart icon on any restaurant or meal to save it here.</p>
        <NuxtLink
          to="/"
          class="bg-brand-500 text-white text-base font-semibold px-8 py-3.5 rounded-full"
        >
          Explore Categories
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const tabs = ['All', 'Meals', 'Vendors']
const activeTab = ref('All')

useSeoMeta({ title: 'Favorites — NearbyMe' })
</script>
