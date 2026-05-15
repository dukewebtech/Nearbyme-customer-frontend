export const useApi = () => {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  function authHeaders(): Record<string, string> {
    try {
      const auth = useAuthStore()
      if (auth.accessToken) return { Authorization: `Bearer ${auth.accessToken}` }
    } catch { /* store not ready */ }
    return {}
  }

  function get<T = any>(path: string, params?: Record<string, any>) {
    return $fetch<T>(`${base}${path}`, { params, headers: authHeaders() })
  }

  function post<T = any>(path: string, body?: any) {
    return $fetch<T>(`${base}${path}`, { method: 'POST', body, headers: authHeaders() })
  }

  function patch<T = any>(path: string, body?: any) {
    return $fetch<T>(`${base}${path}`, { method: 'PATCH', body, headers: authHeaders() })
  }

  function del<T = any>(path: string) {
    return $fetch<T>(`${base}${path}`, { method: 'DELETE', headers: authHeaders() })
  }

  // Auth
  const loginApi  = (email: string, password: string) => post('/auth/login', { email, password })
  const signupApi = (body: any) => post('/auth/signup', body)
  const getMe     = () => get('/auth/me')

  // Restaurants / stores (filter by store_type: 'restaurant' | 'pharmacy' | 'shop')
  const getRestaurants = (params?: Record<string, any>) => get('/restaurants', params)
  const getRestaurant  = (id: string) => get(`/restaurants/${id}`)
  const getPharmacies  = (params?: Record<string, any>) => get('/restaurants', { store_type: 'pharmacy', ...params })
  const getShops       = (params?: Record<string, any>) => get('/restaurants', { store_type: 'shop', ...params })

  // Categories
  const getCategories = (rid: string) => get(`/restaurants/${rid}/categories`)

  // Menu items
  const getMenuItems = (rid: string, params?: Record<string, any>) => get(`/restaurants/${rid}/menu-items`, params)
  const getMenuItem  = (id: string) => get(`/menu-items/${id}`)

  // Cart
  const getCart        = () => get('/cart')
  const addToCart      = (body: any) => post('/cart', body)
  const updateCartItem = (id: string, quantity: number) => patch(`/cart/items/${id}`, { quantity })
  const removeCartItem = (id: string) => del(`/cart/items/${id}`)
  const clearCart      = () => del('/cart')
  const applyPromo     = (code: string) => post('/cart/promo', { promo_code: code })

  // Orders
  const getOrders  = (params?: Record<string, any>) => get('/orders', params)
  const getOrder   = (id: string) => get(`/orders/${id}`)
  const placeOrder = (body: any) => post('/orders', body)

  // Payments
  const initiatePayment = (orderId: string, method: string, callbackUrl?: string) =>
    post('/payments', { order_id: orderId, payment_method: method, ...(callbackUrl ? { callback_url: callbackUrl } : {}) })

  const verifyPayment = (paymentId: string, reference: string) =>
    post('/payments/verify', { payment_id: paymentId, reference })

  return {
    loginApi, signupApi, getMe,
    getRestaurants, getRestaurant, getPharmacies, getShops,
    getCategories, getMenuItems, getMenuItem,
    getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyPromo,
    getOrders, getOrder, placeOrder,
    initiatePayment, verifyPayment,
  }
}
