<script setup lang="ts">
import { useAuthForm } from '@/composables/auth/useAuthForm'

definePageMeta({
  layout: 'blank',
  public: true,

})

const route = useRoute()
const { verifyEmail, resendEmail } = useAuthForm()

// checking until the link's answer comes back; the page shows nothing final before that.
const state = ref<'checking' | 'verified' | 'failed'>('checking')
const email = ref('')
const sending = ref(false)

// Only these answers mean the address is verified; "Invalid verification link." also comes back as 200.
const VERIFIED_MESSAGES = ['Your email has been verified.', 'Email already verified.']

// The link must point at our own API. Otherwise a crafted link could make this
// page fetch another site and show that site's message as ours.
function isOwnApiUrl(url: string) {
  const apiOrigin = new URL(useRuntimeConfig().public.apiBaseUrl as string || '/api', window.location.origin).origin

  try {
    return new URL(url, apiOrigin).origin === apiOrigin
  }
  catch {
    return false
  }
}

onMounted(async () => {
  const redirect = decodeURIComponent(route.query.redirect as string || '')

  if (!redirect || !isOwnApiUrl(redirect)) {
    state.value = 'failed'

    return
  }
  try {
    const res = await verifyEmail(redirect)

    state.value = VERIFIED_MESSAGES.includes(res?.message) ? 'verified' : 'failed'
    email.value = res?.email ?? ''
  }
  catch {
    state.value = 'failed'
  }
})

// The API plugin already toasts a refused request.
async function resend() {
  sending.value = true
  try {
    await resendEmail(email.value)
  }
  catch {}
  finally {
    sending.value = false
  }
}
</script>

<template>
  <BrandShell>
    <template v-if="state === 'checking'">
      <h1 class="text-h3 mb-4">
        Checking your link
      </h1>
      <VProgressLinear
        indeterminate
        color="primary"
      />
    </template>

    <template v-else-if="state === 'verified'">
      <h1 class="text-h3 mb-2">
        Email verified
      </h1>
      <p class="text-body-1 mb-6">
        <template v-if="email">
          <span class="font-weight-medium">{{ email }}</span> is confirmed.
        </template>
        You can sign in now.
      </p>
      <VBtn
        block
        size="large"
        to="/login"
      >
        Go to sign in
      </VBtn>
    </template>

    <form
      v-else
      @submit.prevent="resend"
    >
      <h1 class="text-h3 mb-2">
        This link doesn't work
      </h1>
      <!-- An expired link never reaches the server's verify step, so the page can't know the email: ask for it. -->
      <p class="text-body-1 mb-6">
        It may have expired (links last an hour) or been copied wrongly. Enter your email and we'll send a new one.
      </p>
      <AppTextField
        v-model="email"
        type="email"
        label="Email"
        autocomplete="email"
        class="mb-5"
      />
      <VBtn
        block
        size="large"
        type="submit"
        :loading="sending"
        :disabled="!email.includes('@') || sending"
      >
        Send a new link
      </VBtn>
      <p class="text-body-2 text-medium-emphasis mt-5 mb-0">
        Already verified? <NuxtLink
          to="/login"
          class="text-primary"
        >
          Sign in
        </NuxtLink>
      </p>
    </form>
  </BrandShell>
</template>
