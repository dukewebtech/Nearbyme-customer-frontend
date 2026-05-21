<template>
  <div class="bg-white rounded-2xl p-3 flex gap-3 cursor-pointer active:scale-[0.98] transition-transform" @click="$emit('open', item)">
    <!-- Image -->
    <div class="w-24 h-24 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center relative">
      <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
      <UIcon v-else name="i-lucide-utensils" class="w-8 h-8 text-brand-300" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[#1e1e1e]">{{ item.name }}</p>
          <p class="text-xs text-[#585858] mt-0.5 line-clamp-2 leading-relaxed">{{ item.description }}</p>
        </div>
        <!-- Heart button -->
        <button
          class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
          :class="isFav ? 'bg-[#fce7e3]' : 'bg-[#f5f5f5]'"
          :disabled="toggling"
          @click.stop="toggleFav"
        >
          <UIcon
            name="i-lucide-heart"
            class="w-3.5 h-3.5 transition-colors"
            :class="[isFav ? 'text-brand-500 fav-active' : 'text-[#969696]']"
          />
        </button>
      </div>

      <div class="flex items-center justify-between mt-2">
        <p class="text-sm font-semibold text-brand-500">₦{{ Number(item.price).toLocaleString('en-NG') }}</p>
        <button
          class="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shrink-0"
          @click.stop="$emit('add', item)"
        >
          <UIcon name="i-lucide-plus" class="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  item: any
  isFavorited?: boolean
  favoriteId?: string | null
}>()

const emit = defineEmits<{
  add: [item: any]
  open: [item: any]
  favoriteChanged: [itemId: string, nowFavorited: boolean, favId: string | null]
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
  isFav.value = !wasLiked

  try {
    if (wasLiked) {
      if (!currentFavId) {
        const list = await api.getFavorites() as any
        const match = (list.data ?? []).find(
          (f: any) => f.type === 'meal' && f.menu_item_id === props.item.id
        )
        currentFavId = match?.id ?? null
      }
      if (currentFavId) {
        await api.removeFavorite(currentFavId)
        currentFavId = null
      }
    } else {
      const res = await api.addFavorite({ type: 'meal', menu_item_id: props.item.id }) as any
      currentFavId = res.data?.id ?? res.id ?? null
    }
    emit('favoriteChanged', props.item.id, isFav.value, currentFavId)
  } catch {
    isFav.value = wasLiked
  } finally {
    toggling.value = false
  }
}
</script>

<style scoped>
:deep(.fav-active path) {
  fill: #E85D2F;
  stroke: #E85D2F;
}
</style>
