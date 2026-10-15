<script setup lang="ts">
import type { User } from '@/schemas/auth'
import type { AppAbility } from '@/composables/auth/useAbility'
import { homePath } from '@/utils/home'

definePageMeta({
  public: true,
})

const user = useState<User | null>('user')

const { $ability } = useNuxtApp() as unknown as { $ability: AppAbility }

await navigateTo(user.value ? homePath($ability) : '/login', { replace: true })
</script>

<template>
  <div />
</template>
