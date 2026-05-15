export default defineNuxtRouteMiddleware((_to) => {
  if (import.meta.server) return

  const auth = useAuthStore()
  if (!auth.isLoggedIn) {
    return navigateTo('/auth/login')
  }
})
