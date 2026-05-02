<template>
  <div class="min-h-screen bg-[#011625] flex flex-col items-center justify-between px-6 pt-20 pb-14 max-w-[390px] mx-auto">
    <!-- Slide indicators -->
    <div class="flex gap-2 self-end">
      <span
        v-for="i in 3"
        :key="i"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="step === i - 1 ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/30'"
      />
    </div>

    <!-- Illustration placeholder (food image area) -->
    <div class="flex-1 flex items-center justify-center w-full">
      <div class="w-72 h-72 rounded-full bg-white/5 flex items-center justify-center">
        <UIcon :name="slides[step].icon" class="w-32 h-32 text-brand-500 opacity-80" />
      </div>
    </div>

    <!-- Text -->
    <div class="w-full text-center space-y-3 mb-10">
      <h1 class="text-[32px] font-bold text-white leading-tight" style="font-family: serif">
        {{ slides[step].title }}
      </h1>
      <p class="text-base text-white/70 leading-relaxed">
        {{ slides[step].subtitle }}
      </p>
    </div>

    <!-- Actions -->
    <div class="w-full space-y-3">
      <NuxtLink
        to="/auth/signup"
        class="block w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold text-center"
      >
        Create Account
      </NuxtLink>
      <NuxtLink
        to="/auth/login"
        class="block w-full py-4 rounded-full border border-white/30 text-white text-base font-semibold text-center"
      >
        Log In
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const step = ref(0)

const slides = [
  {
    icon: 'i-lucide-utensils',
    title: 'Food, Delivered Right.',
    subtitle: 'Get your meals delivered quickly, accurately, and fresh right to your doorstep.',
  },
  {
    icon: 'i-lucide-map-pin',
    title: 'Find Nearby Restaurants.',
    subtitle: 'Discover top-rated restaurants and cuisines right in your neighbourhood.',
  },
  {
    icon: 'i-lucide-clock',
    title: 'Track Every Step.',
    subtitle: 'Real-time order tracking from kitchen to your door, always on time.',
  },
]

// Auto-advance slides
onMounted(() => {
  const t = setInterval(() => {
    step.value = (step.value + 1) % 3
  }, 3000)
  onUnmounted(() => clearInterval(t))
})

useSeoMeta({ title: 'Welcome — NearbyMe' })
</script>
