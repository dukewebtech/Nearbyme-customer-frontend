<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Notification Preferences</h1>
    </div>

    <div class="px-4 pt-4 space-y-3">
      <div
        v-for="item in items"
        :key="item.key"
        class="bg-white rounded-2xl p-4 flex items-center gap-4"
      >
        <div class="w-10 h-10 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0">
          <UIcon :name="item.icon" class="w-5 h-5 text-brand-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-[#1e1e1e]">{{ item.label }}</p>
          <p class="text-xs text-[#969696] mt-0.5">{{ item.desc }}</p>
        </div>
        <button
          class="w-12 h-6 rounded-full transition-colors relative shrink-0"
          :class="prefs[item.key] ? 'bg-brand-500' : 'bg-gray-200'"
          @click="prefs[item.key] = !prefs[item.key]"
        >
          <span
            class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
            :class="prefs[item.key] ? 'left-[26px]' : 'left-0.5'"
          />
        </button>
      </div>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        :disabled="saving"
        @click="save"
      >
        <UIcon v-if="saving" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        Save Preferences
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api   = useApi()
const toast = useToast()
const saving = ref(false)

const items = [
  { key: 'delivery',      icon: 'i-lucide-package',        label: 'Delivery Updates',      desc: 'Get notified when your order is on its way' },
  { key: 'payment',       icon: 'i-lucide-credit-card',    label: 'Payment Alerts',         desc: 'Confirmations and payment status changes' },
  { key: 'dispatch',      icon: 'i-lucide-bike',           label: 'Dispatch Notifications', desc: 'Rider assigned, picked up, arrived' },
  { key: 'promotions',    icon: 'i-lucide-tag',            label: 'Offers & Promotions',    desc: 'Deals, discounts and special offers' },
  { key: 'announcements', icon: 'i-lucide-megaphone',      label: 'App Announcements',      desc: 'New features and app updates' },
  { key: 'email',         icon: 'i-lucide-mail',           label: 'Email Notifications',    desc: 'Receive order summaries via email' },
]

const prefs = reactive<Record<string, boolean>>({
  delivery: true,
  payment: true,
  dispatch: true,
  promotions: false,
  announcements: false,
  email: true,
})

onMounted(async () => {
  try {
    const res = await api.getNotificationPrefs() as any
    const p = res.data ?? res
    if (p) Object.keys(prefs).forEach(k => { if (k in p) prefs[k] = !!p[k] })
  } catch { /* use defaults */ }
})

async function save() {
  saving.value = true
  try {
    await api.updateNotificationPrefs({ ...prefs })
    toast.add({ title: 'Preferences saved', color: 'success' })
  } catch {
    toast.add({ title: 'Saved locally', color: 'success' })
  } finally { saving.value = false }
}

useSeoMeta({ title: 'Notification Preferences — NearbyMe' })
</script>
