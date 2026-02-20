<script setup lang="ts">
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import authV2VerifyEmailIllustrationDark from '@images/pages/auth-v2-verify-email-illustration-dark.png'
import authV2VerifyEmailIllustrationLight from '@images/pages/auth-v2-verify-email-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { useAuthForm } from '@/composables/auth/useAuthForm'

definePageMeta({
  layout: 'blank',
  public: true,

})

const authThemeImg = useGenerateImageVariant(
  authV2VerifyEmailIllustrationLight,
  authV2VerifyEmailIllustrationDark,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)
const route = useRoute()
const { verifyEmail, resendEmail } = useAuthForm()
const message = ref('Verifying email...')
const status = ref(false)
const email = ref('')

onMounted(async () => {
  const redirect = route.query.redirect as string
  if (redirect) {
    try {
      const res = await verifyEmail(decodeURIComponent(redirect))

      message.value = res?.message || 'Verification complete.'
      status.value = true
      email.value = res?.email

    }
    catch {
      message.value = 'Verification failed.'
    }
  }
  else {
    message.value = 'Invalid verification link.'
  }
})
</script>

<template>
  <NuxtLink to="/">
    <div class="auth-logo d-flex align-center gap-x-3">
      <VNodeRenderer :nodes="themeConfig.app.logo" />
      <h1 class="auth-title">
        {{ themeConfig.app.title }}
      </h1>
    </div>
  </NuxtLink>

  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      md="8"
      class="d-none d-md-flex"
    >
      <div class="position-relative bg-background w-100 me-0">
        <div
          class="d-flex align-center justify-center w-100 h-100"
          style="padding-inline: 150px;"
        >
          <VImg
            max-width="431"
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <img
          class="auth-footer-mask flip-in-rtl"
          :src="authThemeMask"
          alt="auth-footer-mask"
          height="280"
          width="100"
        >
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-6"
      >
        <VCardText v-if="status === false">
          <h4 class="text-h4 mb-1">
            Verify your email ✉️
          </h4>
          <p class="text-body-1 mb-0">
            Account activation for <span class="font-weight-medium text-high-emphasis">{{ email }} </span> was unsuccessful. Please follow the link inside to resend the verification email.
          </p>
          <VBtn
            block
            class="my-5"
            @click="resendEmail(email)"
          >
            Resend Verification Link
          </VBtn>

          <div class="d-flex align-center justify-center">
            <span class="me-1">Issue with the link?</span><a href="#">Resend</a>
          </div>
        </VCardText>
        <VCardText v-else>
          <h4 class="text-h4 mb-1">
            Verify your email ✉️
          </h4>
          <p class="text-body-1 mb-0">
            Account activation for <span class="font-weight-medium text-high-emphasis">{{ email }} </span> was successful. Please follow the link inside to continue.
          </p>
          <VBtn
            block
            to="/"
            class="my-5"
          >
            Go To Login
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
