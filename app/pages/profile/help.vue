<template>
  <div class="min-h-screen bg-[#fafafa] max-w-[390px] mx-auto pb-8">
    <!-- Header -->
    <div class="bg-white px-4 pt-12 pb-4 flex items-center gap-3">
      <button class="w-9 h-9 rounded-full bg-[#f5f5f5] flex items-center justify-center" @click="$router.back()">
        <UIcon name="i-lucide-arrow-left" class="w-5 h-5 text-[#1e1e1e]" />
      </button>
      <h1 class="text-xl font-bold text-[#1e1e1e]">Help & Support</h1>
    </div>

    <!-- Quick contacts -->
    <div class="px-4 pt-4 grid grid-cols-2 gap-3">
      <a href="tel:+2348000000000" class="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
        <div class="w-11 h-11 rounded-full bg-[#fdefec] flex items-center justify-center">
          <UIcon name="i-lucide-phone" class="w-5 h-5 text-brand-500" />
        </div>
        <p class="text-xs font-semibold text-[#1e1e1e]">Call Support</p>
        <p class="text-[10px] text-[#969696]">Mon–Fri, 8am–8pm</p>
      </a>
      <a href="mailto:support@nearbyme.ng" class="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
        <div class="w-11 h-11 rounded-full bg-[#fdefec] flex items-center justify-center">
          <UIcon name="i-lucide-mail" class="w-5 h-5 text-brand-500" />
        </div>
        <p class="text-xs font-semibold text-[#1e1e1e]">Email Us</p>
        <p class="text-[10px] text-[#969696]">Reply within 24 hrs</p>
      </a>
    </div>

    <!-- Live Chat button -->
    <div class="px-4 pt-3">
      <button class="w-full bg-brand-500 text-white rounded-2xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
          <UIcon name="i-lucide-message-circle" class="w-5 h-5 text-white" />
        </div>
        <div class="flex-1 text-left">
          <p class="text-sm font-semibold">Live Chat</p>
          <p class="text-xs opacity-80">We typically reply in a few minutes</p>
        </div>
        <UIcon name="i-lucide-chevron-right" class="w-4 h-4 text-white/70 shrink-0" />
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 px-4 pt-5 pb-3">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="px-5 py-2 rounded-full text-sm font-semibold transition-colors"
        :class="activeTab === tab ? 'bg-brand-500 text-white' : 'bg-white text-[#1e1e1e]'"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <!-- FAQ list -->
    <div class="px-4 space-y-2">
      <div
        v-for="faq in filteredFaqs"
        :key="faq.q"
        class="bg-white rounded-2xl overflow-hidden"
      >
        <button
          class="w-full flex items-center gap-3 p-4 text-left"
          @click="toggle(faq.q)"
        >
          <span class="flex-1 text-sm font-semibold text-[#1e1e1e]">{{ faq.q }}</span>
          <UIcon
            :name="open === faq.q ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4 text-[#969696] shrink-0"
          />
        </button>
        <div v-if="open === faq.q" class="px-4 pb-4 text-xs text-[#969696] leading-relaxed border-t border-gray-50 pt-3">
          {{ faq.a }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const tabs     = ['Orders', 'Payments', 'Account']
const activeTab = ref('Orders')
const open      = ref<string | null>(null)

function toggle(q: string) {
  open.value = open.value === q ? null : q
}

const faqs: { tab: string; q: string; a: string }[] = [
  { tab: 'Orders',   q: 'How do I track my order?',               a: 'Go to the Orders tab and tap on any active order. You\'ll see a live map with your rider\'s location and estimated arrival time.' },
  { tab: 'Orders',   q: 'Can I cancel my order?',                 a: 'You can cancel your order within 2 minutes of placing it. After that, cancellation may not be possible if the restaurant has started preparing.' },
  { tab: 'Orders',   q: 'What is the delivery code for?',         a: 'A 4-digit delivery code is generated when your order is ready. Share this code with your rider to confirm delivery.' },
  { tab: 'Orders',   q: 'My order is late. What should I do?',    a: 'Tap on your active order, then tap "Contact Rider" to reach out directly. If the issue persists, tap "Live Chat" above.' },
  { tab: 'Payments', q: 'What payment methods are accepted?',     a: 'We accept Paystack payments including cards (Visa, Mastercard, Verve), bank transfers, and USSD. All transactions are secured.' },
  { tab: 'Payments', q: 'Why was I charged twice?',               a: 'Double charges are usually a temporary authorization hold. Your bank will release the duplicate within 3–5 business days. Contact support with your order ID if it persists.' },
  { tab: 'Payments', q: 'How do I get a refund?',                 a: 'Refunds are processed automatically for cancelled orders. If you were charged for an order that was not delivered, contact our support team with your order ID.' },
  { tab: 'Payments', q: 'Is my card information secure?',         a: 'Yes. All card data is encrypted and processed by Paystack, a PCI DSS Level 1 certified payment processor. We never store your card details.' },
  { tab: 'Account',  q: 'How do I update my phone number?',       a: 'Go to Profile → Account Info, update your phone number, and tap Save Changes.' },
  { tab: 'Account',  q: 'How do I change my password?',           a: 'Go to Profile → Settings → Password tab, enter your current password and a new password, then tap Update Password.' },
  { tab: 'Account',  q: 'Can I have multiple delivery addresses?', a: 'Yes. Go to the Addresses section in your profile to add and manage multiple saved addresses.' },
  { tab: 'Account',  q: 'How do I delete my account?',            a: 'To request account deletion, please email us at support@nearbyme.ng with your registered email address and we will process it within 7 business days.' },
]

const filteredFaqs = computed(() => faqs.filter(f => f.tab === activeTab.value))

useSeoMeta({ title: 'Help & Support — NearbyMe' })
</script>
