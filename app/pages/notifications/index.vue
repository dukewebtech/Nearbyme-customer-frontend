<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-[#191919]">Notifications</h1>
      <button v-if="notifications.length" class="text-xs font-medium text-brand-500" @click="markAllRead">
        Mark all read
      </button>
    </div>

    <div v-if="notifications.length" class="px-4 pt-4 space-y-2">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="bg-white rounded-2xl p-4 flex items-start gap-3"
        :class="{ 'opacity-60': n.read }"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="n.iconBg"
        >
          <UIcon :name="n.icon" class="w-5 h-5" :class="n.iconColor" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[#1e1e1e]">{{ n.title }}</p>
          <p class="text-xs text-[#969696] mt-0.5">{{ n.body }}</p>
          <p class="text-[10px] text-[#bdbdbd] mt-1">{{ n.time }}</p>
        </div>
        <div v-if="!n.read" class="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[#fce7e3] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-bell" class="w-10 h-10 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">No Notifications Yet</p>
      <p class="text-sm text-[#969696] mt-1">We'll let you know when something happens.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const notifications = ref([
  {
    id: 1,
    icon: 'i-lucide-check-circle',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-500',
    title: 'Order Delivered!',
    body: 'Your order from The Spice Garden has been delivered.',
    time: '2 mins ago',
    read: false,
  },
  {
    id: 2,
    icon: 'i-lucide-bike',
    iconBg: 'bg-[#fdefec]',
    iconColor: 'text-brand-500',
    title: 'Rider on the way',
    body: 'Emeka is heading to your delivery address.',
    time: '15 mins ago',
    read: false,
  },
  {
    id: 3,
    icon: 'i-lucide-tag',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Special Offer!',
    body: 'Get 20% off your next order. Use code NEARBY20.',
    time: '1 hour ago',
    read: true,
  },
])

function markAllRead() {
  notifications.value.forEach(n => { n.read = true })
}

useSeoMeta({ title: 'Notifications — NearbyMe' })
</script>
