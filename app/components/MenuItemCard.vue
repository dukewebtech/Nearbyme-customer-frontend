<template>
  <div class="bg-white rounded-2xl p-3 flex gap-3 cursor-pointer active:scale-[0.98] transition-transform" @click="$emit('open', item)">
    <!-- Image -->
    <div class="w-24 h-24 rounded-xl bg-[#f5e9e7] shrink-0 overflow-hidden flex items-center justify-center">
      <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
      <UIcon v-else name="i-lucide-utensils" class="w-8 h-8 text-brand-300" />
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
      <div>
        <p class="text-sm font-semibold text-[#1e1e1e]">{{ item.name }}</p>
        <p class="text-xs text-[#585858] mt-0.5 line-clamp-2 leading-relaxed">{{ item.description }}</p>
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
defineProps<{ item: any }>()
defineEmits<{ add: [item: any]; open: [item: any] }>()
</script>
