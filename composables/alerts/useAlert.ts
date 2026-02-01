import { ref } from 'vue'

export type ToastColor = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  text?: string // renamed from description for Vuetify shorthand
  color?: ToastColor
  icon?: string
  duration?: number
}

export const alertState = ref<ToastOptions & { visible: boolean }>({
  visible: false,
  title: '',
  text: '',
  color: 'info',
  icon: '',
  duration: 3000,
})

let timeout: ReturnType<typeof setTimeout> | null = null

export function useAlert() {
  function showAlert(options: ToastOptions) {
    alertState.value = {
      visible: true,
      title: options.title,
      text: options.text ?? '',
      color: options.color ?? 'info',
      icon: options.icon ?? '',
      duration: options.duration ?? 3000,
    }

    if (timeout)
      clearTimeout(timeout)
    timeout = setTimeout(() => {
      alertState.value.visible = false
    }, alertState.value.duration)
  }

  function hide() {
    alertState.value.visible = false
  }

  // convenience helpers
  function success(title: string, text?: string) {
    showAlert({ title, text, color: 'success', icon: '$success' })
  }
  function error(title: string, text?: string) {
    showAlert({ title, text, color: 'error', icon: '$error' })
  }
  function info(title: string, text?: string) {
    showAlert({ title, text, color: 'info', icon: '$info' })
  }
  function warning(title: string, text?: string) {
    showAlert({ title, text, color: 'warning', icon: '$warning' })
  }

  return { alertState, alert: showAlert, hide, success, error, info, warning }
}
