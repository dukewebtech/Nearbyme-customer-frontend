<template>
  <span class="text-xs font-semibold capitalize px-2.5 py-1 rounded-full" :class="style.class">
    {{ style.label }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ status: string }>()

const style = computed(() => {
  const map: Record<string, { label: string; class: string }> = {
    placed:     { label: 'Placed',      class: 'bg-blue-50 text-blue-500' },
    pending:    { label: 'Pending',     class: 'bg-amber-50 text-amber-500' },
    accepted:   { label: 'Accepted',    class: 'bg-sky-50 text-sky-500' },
    preparing:  { label: 'Preparing',   class: 'bg-[#fdefec] text-brand-500' },
    ready:      { label: 'Ready',       class: 'bg-green-50 text-green-600' },
    picked_up:  { label: 'On the way',  class: 'bg-sky-50 text-sky-600' },
    delivered:  { label: 'Delivered',   class: 'bg-green-50 text-green-600' },
    cancelled:  { label: 'Cancelled',   class: 'bg-red-50 text-red-500' },
  }
  return map[props.status] ?? { label: props.status, class: 'bg-gray-100 text-[#969696]' }
})
</script>
