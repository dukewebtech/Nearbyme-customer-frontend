<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4">
      <h1 class="text-2xl font-semibold text-[#191919]">Messages</h1>
    </div>

    <div v-if="chats.length" class="px-4 pt-4 space-y-2">
      <button
        v-for="chat in chats"
        :key="chat.id"
        class="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 text-left"
      >
        <div class="w-12 h-12 rounded-full bg-[#f5e9e7] flex items-center justify-center shrink-0 overflow-hidden">
          <UIcon name="i-lucide-store" class="w-6 h-6 text-brand-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[#1e1e1e] truncate">{{ chat.name }}</p>
          <p class="text-xs text-[#969696] truncate mt-0.5">{{ chat.lastMessage }}</p>
        </div>
        <div class="flex flex-col items-end gap-1 shrink-0">
          <p class="text-[10px] text-[#bdbdbd]">{{ chat.time }}</p>
          <div v-if="chat.unread" class="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
            <span class="text-[10px] text-white font-semibold">{{ chat.unread }}</span>
          </div>
        </div>
      </button>
    </div>

    <div v-else class="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div class="w-20 h-20 rounded-full bg-[#fce7e3] flex items-center justify-center mb-4">
        <UIcon name="i-lucide-message-circle" class="w-10 h-10 text-brand-500" />
      </div>
      <p class="text-base font-semibold text-[#191919]">No Messages Yet</p>
      <p class="text-sm text-[#969696] mt-1">Your conversations with restaurants will appear here.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const chats = ref<any[]>([])

useSeoMeta({ title: 'Messages — NearbyMe' })
</script>
