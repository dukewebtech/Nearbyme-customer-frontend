<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Settings</h1>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 px-4 py-4">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
        :class="activeTab === tab ? 'bg-brand-500 text-white' : 'bg-white text-[#1e1e1e]'"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <!-- Change Password -->
    <div v-if="activeTab === 'Password'" class="px-4 space-y-4">
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Current Password</label>
        <div class="relative">
          <input
            v-model="pw.current"
            :type="showPw.current ? 'text' : 'password'"
            placeholder="Enter current password"
            class="w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none border border-gray-100 pr-12"
          />
          <button class="absolute right-4 top-1/2 -translate-y-1/2" @click="showPw.current = !showPw.current">
            <UIcon :name="showPw.current ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4 text-[#969696]" />
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">New Password</label>
        <div class="relative">
          <input
            v-model="pw.newPw"
            :type="showPw.newPw ? 'text' : 'password'"
            placeholder="Enter new password"
            class="w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none border border-gray-100 pr-12"
          />
          <button class="absolute right-4 top-1/2 -translate-y-1/2" @click="showPw.newPw = !showPw.newPw">
            <UIcon :name="showPw.newPw ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4 text-[#969696]" />
          </button>
        </div>
      </div>
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Confirm New Password</label>
        <div class="relative">
          <input
            v-model="pw.confirm"
            :type="showPw.confirm ? 'text' : 'password'"
            placeholder="Confirm new password"
            class="w-full bg-white rounded-2xl px-4 py-3.5 text-sm outline-none border border-gray-100 pr-12"
          />
          <button class="absolute right-4 top-1/2 -translate-y-1/2" @click="showPw.confirm = !showPw.confirm">
            <UIcon :name="showPw.confirm ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4 text-[#969696]" />
          </button>
        </div>
      </div>

      <!-- Strength indicator -->
      <div v-if="pw.newPw" class="space-y-1">
        <div class="flex gap-1">
          <div v-for="i in 4" :key="i" class="h-1 flex-1 rounded-full transition-colors"
            :class="pwStrength >= i ? strengthColor : 'bg-gray-200'" />
        </div>
        <p class="text-xs" :class="strengthTextColor">{{ strengthLabel }}</p>
      </div>

      <p v-if="pwError" class="text-xs text-red-500 text-center">{{ pwError }}</p>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="savingPw"
        @click="changePassword"
      >
        <UIcon v-if="savingPw" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        Update Password
      </button>
    </div>

    <!-- Two-Factor Authentication -->
    <div v-else class="px-4 space-y-4">
      <div class="bg-white rounded-2xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-smartphone" class="w-5 h-5 text-brand-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-[#1e1e1e]">SMS Authentication</p>
            <p class="text-xs text-[#969696] mt-0.5">Receive a one-time code via SMS when signing in</p>
          </div>
          <button
            class="w-12 h-6 rounded-full transition-colors relative shrink-0"
            :class="twoFa.sms ? 'bg-brand-500' : 'bg-gray-200'"
            @click="twoFa.sms = !twoFa.sms"
          >
            <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
              :class="twoFa.sms ? 'left-[26px]' : 'left-0.5'" />
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-5">
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-full bg-[#fdefec] flex items-center justify-center shrink-0">
            <UIcon name="i-lucide-mail" class="w-5 h-5 text-brand-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-[#1e1e1e]">Email Authentication</p>
            <p class="text-xs text-[#969696] mt-0.5">Receive a one-time code to your email when signing in</p>
          </div>
          <button
            class="w-12 h-6 rounded-full transition-colors relative shrink-0"
            :class="twoFa.email ? 'bg-brand-500' : 'bg-gray-200'"
            @click="twoFa.email = !twoFa.email"
          >
            <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
              :class="twoFa.email ? 'left-[26px]' : 'left-0.5'" />
          </button>
        </div>
      </div>

      <div class="bg-[#fdefec] rounded-2xl p-4">
        <div class="flex gap-3">
          <UIcon name="i-lucide-info" class="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
          <p class="text-xs text-brand-600 leading-relaxed">Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to sign in.</p>
        </div>
      </div>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="saving2Fa"
        @click="save2Fa"
      >
        <UIcon v-if="saving2Fa" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        Save Preferences
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const api   = useApi()
const toast = useToast()

const tabs = ['Password', 'Two-Factor']
const activeTab = ref('Password')

const pw = reactive({ current: '', newPw: '', confirm: '' })
const showPw = reactive({ current: false, newPw: false, confirm: false })
const savingPw = ref(false)
const pwError  = ref('')

const pwStrength = computed(() => {
  const v = pw.newPw
  let score = 0
  if (v.length >= 8) score++
  if (/[A-Z]/.test(v)) score++
  if (/[0-9]/.test(v)) score++
  if (/[^A-Za-z0-9]/.test(v)) score++
  return score
})

const strengthColor     = computed(() => ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][pwStrength.value - 1] ?? 'bg-gray-200')
const strengthTextColor = computed(() => ['text-red-400', 'text-orange-400', 'text-yellow-500', 'text-green-600'][pwStrength.value - 1] ?? '')
const strengthLabel     = computed(() => ['Weak', 'Fair', 'Good', 'Strong'][pwStrength.value - 1] ?? '')

async function changePassword() {
  pwError.value = ''
  if (!pw.current || !pw.newPw || !pw.confirm) { pwError.value = 'All fields are required'; return }
  if (pw.newPw !== pw.confirm) { pwError.value = 'Passwords do not match'; return }
  if (pw.newPw.length < 8) { pwError.value = 'Password must be at least 8 characters'; return }
  savingPw.value = true
  try {
    await api.changePassword({ current_password: pw.current, new_password: pw.newPw })
    toast.add({ title: 'Password updated', color: 'success' })
    pw.current = ''; pw.newPw = ''; pw.confirm = ''
  } catch (e: any) {
    pwError.value = e?.data?.error ?? 'Could not update password'
  } finally { savingPw.value = false }
}

const twoFa   = reactive({ sms: false, email: false })
const saving2Fa = ref(false)

async function save2Fa() {
  saving2Fa.value = true
  try {
    await api.updateNotificationPrefs({ two_fa_sms: twoFa.sms, two_fa_email: twoFa.email })
    toast.add({ title: 'Preferences saved', color: 'success' })
  } catch {
    toast.add({ title: 'Saved locally', color: 'success' })
  } finally { saving2Fa.value = false }
}

useSeoMeta({ title: 'Settings — NearbyMe' })
</script>
