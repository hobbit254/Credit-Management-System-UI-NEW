<script setup lang="ts">
import { useTheme } from 'vuetify'
import ScrollToTop from '@core/components/ScrollToTop.vue'
import initCore from '@core/initCore'
import { initConfigStore, useConfigStore } from '@core/stores/config'
import { hexToRgb } from '@core/utils/colorConverter'
import { useAlert } from '@/composables/alerts/useAlert'

const { global } = useTheme()

// ℹ️ Sync current theme with initial loader theme
initCore()
initConfigStore()

const configStore = useConfigStore()
const { isMobile } = useDevice()
if (isMobile)
  configStore.appContentLayoutNav = 'vertical'
const { alertState, hide } = useAlert()
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(global.current.value.colors.primary)}`">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>

      <VAlert
        v-if="alertState.visible"
        :color="alertState.color"
        :icon="alertState.icon"
        :title="alertState.title"
        :text="alertState.text"
        variant="tonal"
        border="start"
        closable
        class="ma-4 position-fixed"
        style="top: calc(var(--v-layout-top) + 16px); left: 50%; transform: translateX(-50%); z-index: 2000;"
        @click:close="hide"
      />

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
