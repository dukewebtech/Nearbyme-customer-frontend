export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  await auth.init()
  if (auth.isLoggedIn) {
    const cartStore = useCartStore()
    cartStore.fetchCart()
  }
})
