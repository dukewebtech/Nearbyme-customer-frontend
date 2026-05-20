<template>
  <div class="min-h-screen bg-white max-w-[390px] mx-auto">
    <div class="px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Account Information</h1>
    </div>

    <!-- Avatar -->
    <div class="flex justify-center py-6">
      <div class="relative">
        <div class="w-20 h-20 rounded-full bg-[#f5e9e7] flex items-center justify-center overflow-hidden">
          <UIcon name="i-lucide-user-round" class="w-10 h-10 text-brand-500" />
        </div>
        <button class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center">
          <UIcon name="i-lucide-camera" class="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    </div>

    <div class="px-4 space-y-4">
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Full Name</label>
        <input v-model="form.fullName" type="text" placeholder="Enter full name"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Email Address</label>
        <input v-model="form.email" type="email" placeholder="Enter email"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none" />
      </div>
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Phone Number</label>
        <input v-model="form.phone" type="tel" placeholder="e.g. 08012345678"
          class="w-full bg-[#f5f5f5] rounded-2xl px-4 py-3.5 text-sm outline-none" />
      </div>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
        :disabled="saving"
        @click="save"
      >
        <UIcon v-if="saving" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        Save Changes
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api   = useApi()
const auth  = useAuthStore()
const toast = useToast()

const saving = ref(false)
const error  = ref('')

const u = auth.user as any
const form = reactive({
  fullName: `${u?.user_metadata?.first_name ?? u?.first_name ?? ''} ${u?.user_metadata?.last_name ?? u?.last_name ?? ''}`.trim(),
  email:    u?.email ?? '',
  phone:    u?.user_metadata?.phone ?? u?.phone ?? '',
})

async function save() {
  saving.value = true
  error.value  = ''
  try {
    const [first, ...rest] = form.fullName.trim().split(' ')
    await api.updateMe({ first_name: first, last_name: rest.join(' '), phone: form.phone })
    toast.add({ title: 'Profile updated', color: 'success' })
    navigateTo('/profile')
  } catch (e: any) {
    error.value = e?.data?.error ?? 'Could not save changes'
  } finally {
    saving.value = false
  }
}

useSeoMeta({ title: 'Account Info — NearbyMe' })
</script>
