<template>
  <!-- Backdrop -->
  <Transition name="backdrop">
    <div v-if="modelValue" class="fixed inset-0 bg-black/40 z-40" @click="closeSheet" />
  </Transition>

  <!-- Sheet -->
  <Transition name="sheet">
    <div
      v-if="modelValue"
      class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-w-[390px] mx-auto max-h-[92dvh] flex flex-col overflow-hidden"
    >
      <!-- Drag handle -->
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="w-10 h-1 rounded-full bg-[#e0e0e0]" />
      </div>

      <!-- ── CONFIRM STATE: clear cart ── -->
      <div v-if="showClearConfirm" class="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
        <div class="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <UIcon name="i-lucide-shopping-cart" class="w-8 h-8 text-amber-500" />
        </div>
        <p class="text-base font-semibold text-[#1e1e1e]">Start a new cart?</p>
        <p class="text-sm text-[#969696] mt-2 mb-8 leading-relaxed">
          Your cart has items from another restaurant.<br>Clear it and add <strong>{{ item.name }}</strong>?
        </p>
        <div class="w-full flex gap-3">
          <button
            class="flex-1 py-3.5 rounded-full border border-gray-200 text-sm font-semibold text-[#1e1e1e]"
            @click="showClearConfirm = false"
          >Keep Cart</button>
          <button
            class="flex-1 py-3.5 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center gap-2"
            :disabled="adding"
            @click="clearAndAdd"
          >
            <UIcon v-if="adding" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
            {{ adding ? 'Adding…' : 'Clear & Add' }}
          </button>
        </div>
      </div>

      <!-- ── NORMAL STATE ── -->
      <template v-else>
        <!-- Scrollable content -->
        <div class="overflow-y-auto flex-1">
          <!-- Image -->
          <div class="h-52 bg-[#f5e9e7] overflow-hidden relative">
            <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center">
              <UIcon name="i-lucide-utensils" class="w-16 h-16 text-brand-200" />
            </div>
            <button
              class="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
              @click="closeSheet"
            >
              <UIcon name="i-lucide-x" class="w-4 h-4 text-white" />
            </button>
          </div>

          <div class="px-4 pt-4 pb-2">
            <!-- Name + price -->
            <div class="flex items-start justify-between gap-2">
              <h2 class="text-lg font-semibold text-[#1e1e1e] flex-1">{{ item.name }}</h2>
              <p class="text-base font-bold text-brand-500 shrink-0">₦{{ totalPrice.toLocaleString('en-NG') }}</p>
            </div>

            <!-- Prep time -->
            <div class="flex items-center gap-1.5 mt-1">
              <UIcon name="i-lucide-clock" class="w-3.5 h-3.5 text-[#969696]" />
              <span class="text-xs text-[#969696]">{{ item.prep_time_minutes ?? 15 }} min prep time</span>
            </div>

            <!-- Description -->
            <p v-if="item.description" class="text-sm text-[#585858] mt-3 leading-relaxed">{{ item.description }}</p>

            <!-- Variants -->
            <div v-if="variants.length" class="mt-4 space-y-4">
              <div v-for="variant in variants" :key="variant.id">
                <p class="text-sm font-semibold text-[#1e1e1e] mb-2">
                  {{ variant.name }}
                  <span class="text-xs font-normal text-[#969696] ml-1">(Choose one)</span>
                </p>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="opt in variant.options"
                    :key="opt"
                    class="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                    :class="selectedOptions[variant.id] === opt
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-[#1e1e1e] border-gray-200'"
                    @click="selectedOptions[variant.id] = opt"
                  >{{ opt }}</button>
                </div>
              </div>
            </div>

            <!-- Special instructions -->
            <div class="mt-4 mb-2">
              <p class="text-sm font-semibold text-[#1e1e1e] mb-2">Special Instructions</p>
              <textarea
                v-model="instructions"
                rows="2"
                placeholder="Any allergies, substitutions, or requests…"
                class="w-full text-sm text-[#1e1e1e] placeholder:text-[#bdbdbd] bg-[#f5f5f5] rounded-xl px-3 py-2.5 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-4 py-4 border-t border-gray-100 shrink-0 bg-white">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3 bg-[#f5f5f5] rounded-full px-3 py-1.5">
              <button @click="qty = Math.max(1, qty - 1)">
                <UIcon name="i-lucide-minus" class="w-4 h-4 text-[#1e1e1e]" />
              </button>
              <span class="text-sm font-semibold text-[#1e1e1e] w-4 text-center">{{ qty }}</span>
              <button @click="qty++">
                <UIcon name="i-lucide-plus" class="w-4 h-4 text-[#1e1e1e]" />
              </button>
            </div>

            <button
              class="flex-1 bg-brand-500 text-white text-sm font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 disabled:opacity-60"
              :disabled="adding"
              @click="addToCart"
            >
              <UIcon v-if="adding" name="i-lucide-loader-circle" class="w-4 h-4 animate-spin" />
              {{ adding ? 'Adding…' : `Add to Cart — ₦${(totalPrice * qty).toLocaleString('en-NG')}` }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  item: any
  variants: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  'added': []
}>()

const cartStore = useCartStore()
const toast = useToast()

const qty = ref(1)
const instructions = ref('')
const adding = ref(false)
const showClearConfirm = ref(false)
const selectedOptions = ref<Record<string, string>>({})

watch(() => props.variants, (v) => {
  const defaults: Record<string, string> = {}
  v.forEach(variant => {
    if (variant.options?.length) defaults[variant.id] = variant.options[0]
  })
  selectedOptions.value = defaults
}, { immediate: true })

watch(() => props.modelValue, (open) => {
  if (!open) {
    qty.value = 1
    instructions.value = ''
    showClearConfirm.value = false
  }
})

function closeSheet() {
  if (showClearConfirm.value) {
    showClearConfirm.value = false
    return
  }
  emit('update:modelValue', false)
}

const basePrice = computed(() => Number(props.item?.price ?? 0))

const totalPrice = computed(() => {
  let price = basePrice.value
  props.variants.forEach(v => {
    if (selectedOptions.value[v.id] && v.price_modifier) price += Number(v.price_modifier)
  })
  return price
})

function buildInstructions() {
  const choices = props.variants
    .map(v => selectedOptions.value[v.id] ? `${v.name}: ${selectedOptions.value[v.id]}` : null)
    .filter(Boolean).join(', ')
  return [choices, instructions.value].filter(Boolean).join(' | ') || undefined
}

async function addToCart() {
  adding.value = true
  try {
    await cartStore.addItem(props.item.id, qty.value, undefined, buildInstructions())
    toast.add({ title: `${props.item.name} added to cart`, color: 'success' })
    emit('update:modelValue', false)
    emit('added')
  } catch (e: any) {
    const msg: string = e?.data?.error ?? e?.message ?? ''
    if (msg.toLowerCase().includes('different restaurant')) {
      showClearConfirm.value = true
    } else {
      toast.add({ title: msg || 'Could not add to cart', color: 'error' })
    }
  } finally {
    adding.value = false
  }
}

async function clearAndAdd() {
  adding.value = true
  try {
    await cartStore.clear()
    await cartStore.addItem(props.item.id, qty.value, undefined, buildInstructions())
    toast.add({ title: `${props.item.name} added to cart`, color: 'success' })
    showClearConfirm.value = false
    emit('update:modelValue', false)
    emit('added')
  } catch (e: any) {
    toast.add({ title: e?.data?.error ?? 'Could not add to cart', color: 'error' })
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.sheet-enter-active, .sheet-leave-active { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.sheet-enter-from, .sheet-leave-to { transform: translateY(100%); }
</style>
