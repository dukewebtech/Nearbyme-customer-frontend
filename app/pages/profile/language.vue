<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Language</h1>
    </div>

    <div class="px-4 pt-4 space-y-2">
      <button
        v-for="lang in languages"
        :key="lang.code"
        class="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-4 transition-all"
        :class="selected === lang.code ? 'border-2 border-brand-500' : 'border-2 border-transparent'"
        @click="selected = lang.code"
      >
        <span class="text-2xl shrink-0">{{ lang.flag }}</span>
        <div class="flex-1 text-left">
          <p class="text-sm font-semibold text-[#1e1e1e]">{{ lang.name }}</p>
          <p class="text-xs text-[#969696]">{{ lang.native }}</p>
        </div>
        <div v-if="selected === lang.code" class="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
          <UIcon name="i-lucide-check" class="w-3 h-3 text-white" />
        </div>
      </button>
    </div>

    <div class="px-4 pt-6">
      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold"
        @click="save"
      >
        Apply Language
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const toast = useToast()

const languages = [
  { code: 'en',    name: 'English',    native: 'English',    flag: '🇬🇧' },
  { code: 'yo',    name: 'Yoruba',     native: 'Yorùbá',     flag: '🇳🇬' },
  { code: 'ha',    name: 'Hausa',      native: 'Hausa',      flag: '🇳🇬' },
  { code: 'ig',    name: 'Igbo',       native: 'Igbo',       flag: '🇳🇬' },
  { code: 'fr',    name: 'French',     native: 'Français',   flag: '🇫🇷' },
]

const selected = ref(import.meta.client ? (localStorage.getItem('appLanguage') ?? 'en') : 'en')

function save() {
  if (import.meta.client) localStorage.setItem('appLanguage', selected.value)
  toast.add({ title: 'Language updated', color: 'success' })
  navigateTo('/profile')
}

useSeoMeta({ title: 'Language — NearbyMe' })
</script>
