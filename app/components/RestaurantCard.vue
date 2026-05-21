<template>
  <NuxtLink :to="`/restaurant/${restaurant.id}`" class="block bg-white rounded-2xl overflow-hidden shadow-sm">
    <!-- Hero image -->
    <div class="w-full h-[168px] bg-[#f5e9e7] relative flex items-center justify-center">
      <img v-if="restaurant.image_url" :src="restaurant.image_url" class="w-full h-full object-cover" />
      <UIcon v-else name="i-lucide-utensils" class="w-12 h-12 text-brand-300" />

      <!-- Favourite -->
      <button
        class="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-colors"
        :class="isFav ? 'bg-[#fce7e3]' : 'bg-white'"
        :disabled="toggling"
        @click.stop="toggleFav"
      >
        <UIcon
          name="i-lucide-heart"
          class="w-4 h-4 transition-colors"
          :class="isFav ? 'text-brand-500' : 'text-[#969696]'"
          :style="isFav ? 'fill: #E85D2F' : ''"
        />
      </button>

      <!-- Closed badge -->
      <div v-if="restaurant.is_open === false" class="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl">
        <span class="bg-white/90 text-[#191919] text-xs font-semibold px-3 py-1.5 rounded-full">Closed</span>
      </div>
    </div>

    <!-- Info -->
    <div class="px-3 py-3">
      <div class="flex items-start justify-between gap-2">
        <p class="text-sm font-semibold text-[#191919] truncate">{{ restaurant.name }}</p>
        <div class="flex items-center gap-0.5 shrink-0">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-[#f8cc6b] fill-[#f8cc6b]" />
          <span class="text-xs text-[#969696]">{{ restaurant.rating ?? '4.5' }}</span>
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
const props = defineProps<{
  restaurant: any
  isFavorited?: boolean
  favoriteId?: string | null
}>()

const emit = defineEmits<{
  favoriteChanged: [restaurantId: string, nowFavorited: boolean, favId: string | null]
}>()

const api      = useApi()
const isFav    = ref(props.isFavorited ?? false)
const toggling = ref(false)
let currentFavId = props.favoriteId ?? null

watch(() => props.isFavorited, v => { isFav.value = v ?? false })
watch(() => props.favoriteId,  v => { currentFavId = v ?? null })

async function toggleFav() {
  if (toggling.value) return
  toggling.value = true
  const wasLiked = isFav.value
  isFav.value = !wasLiked // optimistic

  try {
    if (wasLiked) {
      // Resolve fav ID if not cached
      if (!currentFavId) {
        const list = await api.getFavorites() as any
        const match = (list.data ?? []).find((f: any) => f.type === 'vendor' && f.restaurant_id === props.restaurant.id)
        currentFavId = match?.id ?? null
      }
      if (currentFavId) {
        await api.removeFavorite(currentFavId)
        currentFavId = null
      }
    } else {
      const res = await api.addFavorite({ type: 'vendor', restaurant_id: props.restaurant.id }) as any
      currentFavId = res.data?.id ?? res.id ?? null
    }
    emit('favoriteChanged', props.restaurant.id, isFav.value, currentFavId)
  } catch {
    isFav.value = wasLiked // revert on error
  } finally {
    toggling.value = false
  }
}
</script>
