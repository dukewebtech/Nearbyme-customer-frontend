<template>
  <div class="min-h-screen bg-white flex flex-col items-center justify-between px-6 pt-16 pb-14 max-w-[390px] mx-auto">
    <div class="flex-1 flex flex-col items-center justify-center gap-8">
      <div class="text-[110px] leading-none select-none">🗺️</div>
      <div class="text-center space-y-3">
        <h1 class="text-2xl font-bold text-[#1e1e1e]">Find Food Near You</h1>
        <p class="text-sm text-[#969696] leading-relaxed max-w-[280px] mx-auto">
          Turn on location to discover the best restaurants around you and enjoy quicker, deliveries.
        </p>
      </div>
    </div>

    <div class="w-full space-y-3">
      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="requesting"
        @click="allowLocation"
      >
        <UIcon v-if="requesting" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        {{ requesting ? 'Getting location…' : 'Allow Location Access' }}
      </button>
      <button class="w-full py-2 text-brand-500 text-base font-medium" @click="skip">
        Skip
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'auth' })

const requesting = ref(false)

function done() {
  if (import.meta.client) localStorage.setItem('locationAsked', '1')
  navigateTo('/category-select')
}

function allowLocation() {
  if (!import.meta.client || !navigator.geolocation) { done(); return }
  requesting.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      localStorage.setItem('userLat', pos.coords.latitude.toString())
      localStorage.setItem('userLng', pos.coords.longitude.toString())
      requesting.value = false
      done()
    },
    () => { requesting.value = false; done() },
    { timeout: 8000 }
  )
}

function skip() { done() }

useSeoMeta({ title: 'Enable Location — NearbyMe' })
</script>
