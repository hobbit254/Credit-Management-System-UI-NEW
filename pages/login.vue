<script setup lang="ts">
import { useAuthForm } from '@/composables/auth/useAuthForm'

definePageMeta({
  layout: 'blank',
  public: true,
  guestOnly: true,
})

const { loginForm, login, loading } = useAuthForm()

const isPasswordVisible = ref(false)
</script>

<template>
  <BrandShell>
    <VForm @submit.prevent="login">
      <h1 class="text-h3 mb-6">
        Sign in
      </h1>
      <AppTextField
        v-model="loginForm.email"
        autofocus
        label="Email"
        type="email"
        autocomplete="username"
        class="mb-5"
      />
      <AppTextField
        v-model="loginForm.password"
        label="Password"
        :type="isPasswordVisible ? 'text' : 'password'"
        autocomplete="current-password"
        :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
      />
      <VCheckbox
        v-model="loginForm.remember"
        label="Keep me signed in"
        class="my-4"
      />
      <VBtn
        block
        size="large"
        type="submit"
        :loading="loading"
        :disabled="loading"
      >
        Sign in
      </VBtn>
      <!-- There is no self-service reset: an admin sets a new password on the users page. -->
      <p class="text-body-2 text-medium-emphasis mt-5 mb-0">
        Forgot your password? Ask an administrator to reset it.
      </p>
    </VForm>
  </BrandShell>
</template>
