import type { AxiosInstance } from 'axios'
import type { NewUser, User } from '@/schemas/users'
import { useAlert } from '@/composables/alerts/useAlert'
import type { Pagination } from '@/schemas/pagination'

export function useUsers() {
  const { $api } = useNuxtApp() as unknown as { $api: AxiosInstance }
  const users = ref<User[]>([])
  const loading = ref(false)
  const { alert: showToast } = useAlert()

  const pagination = ref<Pagination>({
    total: 0,
    perPage: 10,
    currentPage: 1,
    lastPage: 1,
  })

  async function fetchAllUsers(options?: { page?: number; perPage?: number }) {
    loading.value = true
    try {
      if (options?.page)
        pagination.value.currentPage = options.page

      if (options?.perPage)
        pagination.value.perPage = options.perPage

      const { data } = await $api.get('users', {
        params: {
          page: pagination.value.currentPage,
          per_page: pagination.value.perPage,
        },
      })

      const payload = data.value ?? data

      const [rows, pageInfo] = Array.isArray(payload.data)
        ? payload.data
        : [payload.data.rows, payload.data.pagination]

      users.value = rows ?? []
      pagination.value = {
        total: pageInfo.total,
        perPage: pagination.value.perPage,
        currentPage: pageInfo.currentPage,
        lastPage: pageInfo.lastPage,
      }
    }
    finally {
      loading.value = false
    }
  }

  async function fetchAllActiveUsers() {
    const { data } = await $api.get('users/active')

    let result: User[] = []
    if (Array.isArray(data))
      result = data
    else if (data && Array.isArray(data.data))
      result = data.data

    users.value = result // <-- update reactive state here

    return result
  }

  const openAdd = ref(false)

  const newUser = ref<NewUser>({
    full_name: '',
    email: '',
    password: '',
    role_uuid: '',
    password_confirmation: '',
  })

  function addUser() {
    newUser.value = { full_name: '', email: '', password: '', role_uuid: '', password_confirmation: '' }
    openAdd.value = true
  }

  async function createUser() {
    loading.value = true
    try {
      const { data } = await $api.post('users/create', newUser.value)

      showToast({
        title: 'Create User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
      openAdd.value = false
    }
  }

  const openEdit = ref(false)
  const userToEdit = ref<User | null>(null)

  function editUser(user: User) {
    userToEdit.value = { ...user }
    openEdit.value = true
  }

  async function updateUser(updated: User) {
    loading.value = true
    try {
      const { data } = await $api.put('users/update', updated)

      showToast({
        title: 'Update User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
      openEdit.value = false
    }
  }

  const openDelete = ref(false)
  const userToDelete = ref<User | null>(null)

  function deleteUserModal(user: User) {
    userToDelete.value = { ...user }
    openDelete.value = true
  }

  async function deleteUser(user: User) {
    loading.value = true
    try {
      const { data } = await $api.put('users/delete', {
        user_uuid: user.user_uuid,
      })

      showToast({
        title: 'Delete User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
      openDelete.value = false
    }
  }

  async function restoreUser(user: User) {
    loading.value = true
    try {
      const { data } = await $api.put('users/restore', {
        user_uuid: user.user_uuid,
      })

      showToast({
        title: 'Restore User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
    }
  }

  async function activateUser(user: User) {
    loading.value = true
    try {
      const { data } = await $api.put('users/updateUserStatus', {
        user_uuid: user.user_uuid,
        status: 1,
      })

      showToast({
        title: 'Activate User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
    }
  }

  async function deactivateUser(user: User) {
    loading.value = true
    try {
      const { data } = await $api.put('users/updateUserStatus', {
        user_uuid: user.user_uuid,
        status: 0,
      })

      showToast({
        title: 'Deactivate User',
        text: data.message,
        color: 'success',
        icon: '$success',
      })
      await fetchAllUsers()
    }
    finally {
      loading.value = false
    }
  }

  return {
    users,
    pagination,
    fetchAllUsers,
    showToast,
    loading,
    openAdd,
    newUser,
    addUser,
    createUser,
    openEdit,
    editUser,
    updateUser,
    userToEdit,
    openDelete,
    deleteUserModal,
    deleteUser,
    userToDelete,
    restoreUser,
    activateUser,
    deactivateUser,
    fetchAllActiveUsers,
  }
}
