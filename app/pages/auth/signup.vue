<template>
  <div class="min-h-screen bg-white flex flex-col px-6 pt-14 pb-10 max-w-[390px] mx-auto">
    <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-8" @click="$router.back()">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
    </button>

    <h1 class="text-[20px] font-semibold text-[#191919] mb-1">Create Account</h1>
    <p class="text-sm text-[#969696] mb-8">Create your account to unlock exclusive deals, save favorites, and more.</p>

    <!-- Email / Phone tabs -->
    <div class="flex bg-[#f0f0f0] rounded-full p-1 mb-6">
      <button
        v-for="tab in ['Email', 'Phone Number']"
        :key="tab"
        class="flex-1 py-2 rounded-full text-sm font-medium transition-colors"
        :class="activeTab === tab ? 'bg-brand-500 text-white' : 'text-[#1e1e1e]'"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <div class="space-y-4 flex-1">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-[#191919] mb-2">First Name</label>
          <input v-model="form.firstName" type="text" placeholder="John"
            class="w-full bg-[#f5f5f5] rounded-full px-5 py-3.5 text-sm placeholder:text-[#bababa] outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-[#191919] mb-2">Last Name</label>
          <input v-model="form.lastName" type="text" placeholder="Doe"
            class="w-full bg-[#f5f5f5] rounded-full px-5 py-3.5 text-sm placeholder:text-[#bababa] outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Email Address</label>
        <input v-model="form.email" type="email" placeholder="Enter your Email"
          class="w-full bg-[#f5f5f5] rounded-full px-5 py-3.5 text-sm placeholder:text-[#bababa] outline-none" />
      </div>

      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Password</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Min. 8 Characters"
            class="w-full bg-[#f5f5f5] rounded-full px-5 py-3.5 text-sm placeholder:text-[#bababa] outline-none pr-12"
          />
          <button class="absolute right-4 top-1/2 -translate-y-1/2 text-[#969696]" @click="showPassword = !showPassword">
            <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="loading"
        @click="handleSignup"
      >
        <UIcon v-if="loading" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        {{ loading ? 'Creating account…' : 'Continue' }}
      </button>

      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-gray-200" />
        <span class="text-xs text-[#191919]">Or Create Account With</span>
        <div class="flex-1 h-px bg-gray-200" />
      </div>

      <button class="w-full py-3.5 rounded-full border border-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-[#191919]">
        <UIcon name="i-simple-icons-google" class="w-4 h-4" />
        Continue with Google
      </button>
    </div>

    <p class="text-center text-sm text-[#bababa] mt-6">
      Already have an account?
      <NuxtLink to="/auth/login" class="text-brand-500 font-medium">Sign In</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref('Email')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({ firstName: '', lastName: '', email: '', password: '' })

async function handleSignup() {
  if (!form.firstName || !form.email || !form.password) {
    error.value = 'Please fill in all required fields'
    return
  }
  if (form.password.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.signup(form.email, form.password, form.firstName, form.lastName)
    router.push('/location-permission')
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? 'Signup failed'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Create Account — NearbyMe' })
</script>
