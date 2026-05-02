<template>
  <Transition name="bubble">
    <NuxtLink
      v-if="show"
      to="/cart"
      class="fixed bottom-24 right-4 z-50 w-16 h-16 rounded-full bg-brand-500 shadow-xl flex flex-col items-center justify-center text-white"
    >
      <span class="text-[10px] font-semibold leading-tight">₦{{ shortTotal }}</span>
      <div class="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center mt-0.5">
        <span class="text-[9px] font-bold text-white">{{ cartStore.itemCount }}</span>
      </div>
    </NuxtLink>
  </Transition>
</template>

<script setup lang="ts">
const cartStore = useCartStore()
const route = useRoute()

const HIDDEN_ROUTES = ['/cart', '/checkout']

const show = computed(() =>
  cartStore.itemCount > 0 &&
  !HIDDEN_ROUTES.some(r => route.path.startsWith(r)) &&
  !route.path.startsWith('/restaurant/')
)

const shortTotal = computed(() => {
  const t = cartStore.subtotal
  return t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k` : t.toLocaleString('en-NG')
})
</script>

<style scoped>
.bubble-enter-active, .bubble-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
}
.bubble-enter-from, .bubble-leave-to {
  transform: scale(0.4);
  opacity: 0;
}
</style>
