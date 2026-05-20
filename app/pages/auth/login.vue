<template>
  <div class="min-h-screen bg-white flex flex-col px-6 pt-14 pb-10 max-w-[390px] mx-auto">
    <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center mb-8" @click="$router.back()">
      <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
    </button>

    <h1 class="text-[20px] font-semibold text-[#191919] mb-1">Welcome Back. Login</h1>
    <p class="text-sm text-[#969696] mb-8">Sign in to reorder your favorites, track deliveries and more.</p>

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
      <!-- Email Address -->
      <div>
        <label class="block text-sm font-medium text-[#191919] mb-2">Email Address</label>
        <input
          v-model="form.email"
          type="email"
          placeholder="Enter your Email"
          class="w-full bg-[#f5f5f5] rounded-full px-5 py-3.5 text-sm placeholder:text-[#bababa] outline-none"
        />
      </div>

      <!-- Password -->
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

      <div class="flex items-center justify-between">
        <label class="flex items-center gap-2 text-sm text-[#191919]">
          <input v-model="rememberMe" type="checkbox" class="accent-brand-500" />
          Remember Me
        </label>
        <button class="text-sm text-brand-500 font-medium">Forgot Password</button>
      </div>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

      <button
        class="w-full py-4 rounded-full bg-brand-500 text-white text-base font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
        :disabled="loading"
        @click="handleLogin"
      >
        <UIcon v-if="loading" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
        {{ loading ? 'Signing in…' : 'Log In' }}
      </button>

      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-gray-200" />
        <span class="text-xs text-[#191919]">Or Continue With</span>
        <div class="flex-1 h-px bg-gray-200" />
      </div>

      <button class="w-full py-3.5 rounded-full border border-gray-200 flex items-center justify-center gap-3 text-sm font-medium text-[#191919]">
        <UIcon name="i-simple-icons-google" class="w-4 h-4" />
        Continue with Google
      </button>
    </div>

    <p class="text-center text-sm text-[#bababa] mt-6">
      Don't have an account?
      <NuxtLink to="/auth/signup" class="text-brand-500 font-medium">Sign Up</NuxtLink>
    </p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const router = useRouter()
const auth = useAuthStore()
const cartStore = useCartStore()

const activeTab = ref('Email')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({ email: '', password: '' })

async function handleLogin() {
  if (!form.email || !form.password) {
    error.value = 'Please fill in all fields'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.email, form.password)
    await cartStore.fetchCart()
    const locationAsked = import.meta.client && localStorage.getItem('locationAsked')
    router.push(locationAsked ? '/category-select' : '/location-permission')
  } catch (e: any) {
    error.value = e?.data?.error ?? e?.message ?? 'Invalid credentials'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Sign In — NearbyMe' })
</script>
