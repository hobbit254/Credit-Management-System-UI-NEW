import { useAlert } from '@/composables/alerts/useAlert'

// Copies a record's ID and says so: copyId(uuid, 'Debtor') shows "Debtor ID copied".
export function copyId(id: string, what: string) {
  navigator.clipboard.writeText(id)
  useAlert().alert({ title: 'Copied', text: `${what} ID copied`, color: 'success', icon: 'tabler-clipboard-check' })
}
