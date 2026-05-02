<template>
  <NuxtLink :to="`/restaurant/${restaurant.id}`" class="block bg-white rounded-2xl overflow-hidden shadow-sm">
    <!-- Hero image -->
    <div class="w-full h-[168px] bg-[#f5e9e7] relative flex items-center justify-center">
      <img v-if="restaurant.image_url" :src="restaurant.image_url" class="w-full h-full object-cover" />
      <UIcon v-else name="i-lucide-utensils" class="w-12 h-12 text-brand-300" />

      <!-- Favourite -->
      <button
        class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm"
        @click.prevent="toggleFav"
      >
        <UIcon :name="isFav ? 'i-lucide-heart' : 'i-lucide-heart'" class="w-4 h-4" :class="isFav ? 'text-brand-500 fill-brand-500' : 'text-[#969696]'" />
      </button>

      <!-- Closed badge -->
      <div v-if="!restaurant.is_open" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl">
        <span class="bg-white/90 text-[#191919] text-xs font-semibold px-3 py-1.5 rounded-full">Closed</span>
      </div>
    </div>

    <!-- Info -->
    <div class="px-3 py-3">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-semibold text-[#191919] truncate">{{ restaurant.name }}</p>
        <div class="flex items-center gap-0.5 shrink-0">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-[#f8cc6b] fill-[#f8cc6b]" />
          <span class="text-xs text-[#969696]">4.5</span>
        </div>
      </div>
      <div class="flex items-center gap-3 mt-1.5">
        <div class="flex items-center gap-1 text-[10px] text-[#969696]">
          <UIcon name="i-lucide-clock" class="w-3 h-3" />
          {{ restaurant.average_prep_time_minutes ?? 30 }} Mins
        </div>
        <div class="flex items-center gap-1 text-[10px] text-[#969696]">
          <UIcon name="i-lucide-map-pin" class="w-3 h-3" />
          {{ restaurant.delivery_radius_km ?? 5 }} KM
        </div>
        <div class="flex items-center gap-1 text-[10px] text-[#969696]">
          <UIcon name="i-lucide-bike" class="w-3 h-3" />
          ₦500
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = defineProps<{ restaurant: any }>()
const isFav = ref(false)
function toggleFav() { isFav.value = !isFav.value }
</script>
