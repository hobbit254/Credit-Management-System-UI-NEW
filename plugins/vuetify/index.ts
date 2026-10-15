import { createVuetify } from 'vuetify'
import { VBtn } from 'vuetify/components/VBtn'
import { VVideo } from 'vuetify/labs/VVideo'
import defaults from './defaults'
import { icons } from './icons'
import { themes } from './theme'
import { themeConfig } from '@themeConfig'

// Styles
import '@core/scss/template/libs/vuetify/index.scss'
import 'vuetify/styles'

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
    aliases: {
      IconBtn: VBtn,
    },
    components: {
      VVideo,
    },
    defaults,
    icons,
    theme: { defaultTheme: resolveVuetifyTheme(themeConfig.app.theme), themes },

  })

  nuxtApp.vueApp.use(vuetify)
})
