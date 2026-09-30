<script setup lang="ts">
import type { User } from '@/schemas/auth'

definePageMeta({
  public: true,
})

const user = useState<User | null>('user')

await navigateTo(user.value ? '/dashboard' : '/login', { replace: true })
</script>

<template>
  <div />
</template>
