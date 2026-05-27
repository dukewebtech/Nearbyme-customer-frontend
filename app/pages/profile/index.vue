<template>
  <div class="pb-[72px] min-h-screen bg-[#fafafa]">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-5">
      <h1 class="text-2xl font-semibold text-[#191919] mb-5">Profile</h1>

      <!-- Avatar + info -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-[#f5e9e7] flex items-center justify-center shrink-0 overflow-hidden">
          <UIcon name="i-lucide-user-round" class="w-8 h-8 text-brand-500" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-base font-semibold text-[#191919] truncate">{{ fullName || 'User' }}</p>
          <p class="text-sm text-[#969696] truncate">{{ authStore.user?.email ?? '' }}</p>
        </div>
        <button class="w-9 h-9 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0" @click="navigateTo('/profile/account')">
          <UIcon name="i-lucide-pencil" class="w-4 h-4 text-brand-500" />
        </button>
      </div>
    </div>

    <!-- Menu list -->
    <div class="px-4 pt-4 space-y-2">
      <button
        v-for="item in menuItems"
        :key="item.label"
        class="w-full bg-white rounded-2xl px-4 py-4 flex items-center gap-3 text-left"
        @click="item.action?.()"
      >
        <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :class="item.danger ? 'bg-[#ffe6e6]' : 'bg-[#fdefec]'"
        >
          <UIcon :name="item.icon" class="w-5 h-5" :class="item.danger ? 'text-red-500' : 'text-brand-500'" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold" :class="item.danger ? 'text-red-500' : 'text-[#1e1e1e]'">{{ item.label }}</p>
          <p class="text-xs text-[#969696] mt-0.5">{{ item.desc }}</p>
        </div>
        <UIcon v-if="!item.danger" name="i-lucide-chevron-right" class="w-4 h-4 text-[#969696] shrink-0" />
      </button>
    </div>

    <!-- Version -->
    <p class="text-center text-xs text-[#969696] mt-6">NearbyMe v1.0.0</p>

    <!-- Logout confirm modal -->
    <UModal v-model:open="showLogout">
      <template #content>
        <div class="p-6 text-center">
          <div class="w-14 h-14 rounded-full bg-[#ffe6e6] flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-lucide-log-out" class="w-7 h-7 text-red-500" />
          </div>
          <p class="text-base font-semibold text-[#1e1e1e] mb-1">Log Out?</p>
          <p class="text-sm text-[#969696] mb-6">You will be signed out of your NearbyMe account.</p>
          <div class="flex gap-3">
            <button
              class="flex-1 py-3 rounded-full border border-gray-200 text-sm font-semibold text-[#1e1e1e]"
              @click="showLogout = false"
            >Cancel</button>
            <button
              class="flex-1 py-3 rounded-full bg-red-500 text-white text-sm font-semibold"
              @click="confirmLogout"
            >Log Out</button>
          </div>
        </div>
      </template>
    </UModal>
    <p class="text-center text-xs text-gray-400 py-4">v2.0.1</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const router = useRouter()
const showLogout = ref(false)

const fullName = computed(() => {
  const u = authStore.user as any
  if (!u) return ''
  return `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
})

const menuItems = [
  {
    icon: 'i-lucide-user',
    label: 'Account Info',
    desc: 'Full name, Contact details, Birth date',
    action: () => navigateTo('/profile/account'),
  },
  {
    icon: 'i-lucide-shield',
    label: 'Settings',
    desc: 'Change Password, Two-Step Authentication',
    action: () => navigateTo('/profile/settings'),
  },
  {
    icon: 'i-lucide-credit-card',
    label: 'Payment Method',
    desc: 'Account details, Cards',
    action: () => navigateTo('/profile/payment-methods'),
  },
  {
    icon: 'i-lucide-bell',
    label: 'Notification Preferences',
    desc: 'Delivery, Payment, Dispatch alerts',
    action: () => navigateTo('/profile/notifications-pref'),
  },
  {
    icon: 'i-lucide-globe',
    label: 'Language',
    desc: 'English (Default)',
    action: () => navigateTo('/profile/language'),
  },
  {
    icon: 'i-lucide-life-buoy',
    label: 'Help & Support',
    desc: 'Report, FAQ, Customer Service',
    action: () => navigateTo('/profile/help'),
  },
  {
    icon: 'i-lucide-log-out',
    label: 'Log Out',
    desc: 'Sign Out of NearbyMe',
    danger: true,
    action: () => { showLogout.value = true },
  },
]

async function confirmLogout() {
  showLogout.value = false
  authStore.logout()
  router.push('/auth/login')
}

useSeoMeta({ title: 'Profile — NearbyMe' })
</script>
