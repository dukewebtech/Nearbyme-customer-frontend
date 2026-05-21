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

  // Profile
  const getMe     = () => get('/users/me')
  const updateMe  = (body: any) => patch('/users/me', body)
  const getNotificationPreferences    = () => get('/users/me/notification-preferences')
  const updateNotificationPreferences = (body: any) => patch('/users/me/notification-preferences', body)

  // Addresses
  const getAddresses  = () => get('/addresses')
  const createAddress = (body: any) => post('/addresses', body)
  const updateAddress = (id: string, body: any) => patch(`/addresses/${id}`, body)
  const deleteAddress = (id: string) => del(`/addresses/${id}`)

  // Restaurants / Pharmacies / Shops
  const getRestaurants       = (params?: Record<string, any>) => get('/restaurants', { store_type: 'restaurant', ...params })
  const getRestaurant        = (id: string) => get(`/restaurants/${id}`)
  const getPharmacies        = (params?: Record<string, any>) => get('/restaurants', { store_type: 'pharmacy', ...params })
  const getShops             = (params?: Record<string, any>) => get('/restaurants', { store_type: 'shop', ...params })
  const getBanners            = () => get('/banners')
  const getRestaurantBanners = (rid: string) => get(`/restaurants/${rid}/banners`)
  const getRestaurantReviews = (rid: string) => get(`/restaurants/${rid}/reviews`)

  // Global categories
  const getGlobalCategories = (storeType?: string) => get('/categories', storeType ? { store_type: storeType } : undefined)

  // Per-restaurant categories & menu
  const getCategories = (rid: string) => get(`/restaurants/${rid}/categories`)
  const getMenuItems  = (rid: string, params?: Record<string, any>) => get(`/restaurants/${rid}/menu-items`, params)
  const getMenuItem   = (id: string) => get(`/menu-items/${id}`)

  // Search
  const search               = (params: Record<string, any>) => get('/search', params)
  const getSearchSuggestions = (q: string) => get('/search/suggestions', { q })
  const getSearchHistory     = () => get('/search/history')
  const clearSearchHistory   = () => del('/search/history')

  // Favorites
  const getFavorites   = (params?: Record<string, any>) => get('/favorites', params)
  const addFavorite    = (body: any) => post('/favorites', body)
  const removeFavorite = (id: string) => del(`/favorites/${id}`)

  // Cart
  const getCart        = () => get('/cart')
  const addToCart      = (body: any) => post('/cart', body)
  const updateCartItem = (id: string, quantity: number) => patch(`/cart/items/${id}`, { quantity })
  const removeCartItem = (id: string) => del(`/cart/items/${id}`)
  const clearCart      = () => del('/cart')
  const applyPromo     = (code: string) => post('/cart/promo', { promo_code: code })

  // Orders
  const getOrders    = (params?: Record<string, any>) => get('/orders', params)
  const getOrder     = (id: string) => get(`/orders/${id}`)
  const placeOrder   = (body: any) => post('/orders', body)
  const trackOrder   = (id: string) => get(`/orders/${id}/track`)
  const confirmOrder = (id: string, deliveryCode: string) => post(`/orders/${id}/confirm`, { delivery_code: deliveryCode })
  const reorder      = (id: string) => post(`/orders/${id}/reorder`)
  const getReceipt   = (id: string) => get(`/orders/${id}/receipt`)

  // Payments
  const initiatePayment = (orderId: string, method: string, callbackUrl?: string) =>
    post('/payments', { order_id: orderId, payment_method: method, ...(callbackUrl ? { callback_url: callbackUrl } : {}) })
  const verifyPayment = (paymentId: string, reference: string) =>
    post('/payments/verify', { payment_id: paymentId, reference })

  // Reviews
  const reviewRestaurant = (id: string, body: any) => post(`/restaurants/${id}/reviews`, body)
  const reviewRider      = (id: string, body: any) => post(`/riders/${id}/reviews`, body)

  // Notifications
  const getNotifications     = (params?: Record<string, any>) => get('/notifications', params)
  const markNotificationRead = (id: string) => patch(`/notifications/${id}/read`, {})

  // Beneficiaries / saved payment methods
  const getBeneficiaries   = () => get('/beneficiaries')
  const createBeneficiary  = (body: any) => post('/beneficiaries', body)
  const deleteBeneficiary  = (id: string) => del(`/beneficiaries/${id}`)
  const getPaymentMethods  = () => get('/beneficiaries')

  // Aliases used by profile sub-pages
  const getNotificationPrefs    = () => get('/users/me/notification-preferences')
  const updateNotificationPrefs = (body: any) => patch('/users/me/notification-preferences', body)
  const changePassword          = (body: any) => post('/auth/change-password', body)

  return {
    loginApi, signupApi,
    getMe, updateMe, getNotificationPreferences, updateNotificationPreferences,
    getNotificationPrefs, updateNotificationPrefs, changePassword,
    getAddresses, createAddress, updateAddress, deleteAddress,
    getRestaurants, getRestaurant, getPharmacies, getShops,
    getBanners, getRestaurantBanners, getRestaurantReviews,
    getGlobalCategories, getCategories, getMenuItems, getMenuItem,
    search, getSearchSuggestions, getSearchHistory, clearSearchHistory,
    getFavorites, addFavorite, removeFavorite,
    getCart, addToCart, updateCartItem, removeCartItem, clearCart, applyPromo,
    getOrders, getOrder, placeOrder, trackOrder, confirmOrder, reorder, getReceipt,
    initiatePayment, verifyPayment,
    reviewRestaurant, reviewRider,
    getNotifications, markNotificationRead,
    getBeneficiaries, createBeneficiary, deleteBeneficiary, getPaymentMethods,
  }
}
