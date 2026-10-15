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
  <div class="login">
    <div class="login-brand">
      <span class="brand-name">Plugpoint</span>
      <p class="brand-line d-none d-md-block">
        Every device, every shilling, every customer.
      </p>
      <p class="brand-note d-none d-md-block">
        Credit and stock records for the shop.
      </p>
    </div>

    <main class="login-form">
      <VForm
        class="w-100"
        style="max-width: 380px;"
        @submit.prevent="login"
      >
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
    </main>
  </div>
</template>

<style scoped>
.login {
  display: flex;
  flex-wrap: wrap;
  min-block-size: 100vh;
  background: rgb(var(--v-theme-background));
}

/* Always the ink panel, in light and dark mode alike. */
.login-brand {
  display: flex;
  flex: 1 1 420px;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  background: #15262B;
  color: #E6ECEA;
  padding: clamp(24px, 6vw, 80px);
}

.brand-name {
  font-family: "Bricolage Grotesque", sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
}

.brand-line {
  max-inline-size: 14ch;
  margin: 0;
  font-family: "Bricolage Grotesque", sans-serif;
  font-size: clamp(2.5rem, 5vw, 4.25rem);
  letter-spacing: -0.025em;
  line-height: 1.02;
}

.brand-note {
  margin: 0;
  color: #9FB1AD;
}

.login-form {
  display: flex;
  flex: 1 1 420px;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
}

@media (max-width: 959px) {
  .login-brand { flex-basis: 100%; }
}
</style>
