export const useGiftStore = defineStore('gift', () => {
  const isActive = ref(false)
  const name     = ref('')
  const phone    = ref('')
  const email    = ref('')
  const address  = ref('')
  const note     = ref('')

  function activate(data: { name: string; phone: string; email: string; address: string; note: string }) {
    name.value     = data.name
    phone.value    = data.phone
    email.value    = data.email
    address.value  = data.address
    note.value     = data.note
    isActive.value = true
  }

  function clear() {
    isActive.value = false
    name.value = phone.value = email.value = address.value = note.value = ''
  }

  return { isActive, name, phone, email, address, note, activate, clear }
})
