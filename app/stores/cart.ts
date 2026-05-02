export const useCartStore = defineStore('cart', () => {
  const api = useApi()

  const cart = ref<any>(null)
  const loading = ref(false)

  const items = computed<any[]>(() => cart.value?.cart_items ?? [])
  const itemCount = computed(() => items.value.reduce((s: number, i: any) => s + i.quantity, 0))
  const subtotal = computed(() => items.value.reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0))

  async function fetchCart() {
    loading.value = true
    try {
      const res = await api.getCart() as any
      cart.value = res.data ?? null
    } catch { cart.value = null }
    finally { loading.value = false }
  }

  async function addItem(menuItemId: string, quantity = 1, variantId?: string, instructions?: string) {
    await api.addToCart({ menu_item_id: menuItemId, quantity, variant_id: variantId ?? null, special_instructions: instructions ?? null })
    await fetchCart()
  }

  async function updateItem(cartItemId: string, quantity: number) {
    if (quantity <= 0) {
      await api.removeCartItem(cartItemId)
    } else {
      await api.updateCartItem(cartItemId, quantity)
    }
    await fetchCart()
  }

  async function removeItem(cartItemId: string) {
    await api.removeCartItem(cartItemId)
    await fetchCart()
  }

  async function clear() {
    await api.clearCart()
    cart.value = null
  }

  return { cart, loading, items, itemCount, subtotal, fetchCart, addItem, updateItem, removeItem, clear }
})
