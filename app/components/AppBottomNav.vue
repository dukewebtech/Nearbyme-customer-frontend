<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-[#fafafa] border-t border-gray-100 max-w-[390px] mx-auto">
    <div class="flex items-center justify-around px-2 pt-2 pb-5">
      <NuxtLink
        v-for="item in tabs"
        :key="item.to"
        :to="item.to"
        class="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[56px]"
        :class="isActive(item.to) ? 'text-brand-500' : 'text-[#969696]'"
      >
        <div class="relative">
          <UIcon :name="item.icon" class="w-6 h-6" />
          <span
            v-if="item.badge && cartCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
          >{{ cartCount }}</span>
        </div>
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute()
const cartStore = useCartStore()

const cartCount = computed(() => cartStore.itemCount)

const tabs = [
  { label: 'Home',      to: '/',              icon: 'i-lucide-home' },
  { label: 'Order',     to: '/orders',        icon: 'i-lucide-shopping-bag', badge: true },
  { label: 'Message',   to: '/messages',      icon: 'i-lucide-message-circle' },
  { label: 'Favorites', to: '/favorites',     icon: 'i-lucide-heart' },
  { label: 'Profile',   to: '/profile',       icon: 'i-lucide-user-round' },
]

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}
</script>
