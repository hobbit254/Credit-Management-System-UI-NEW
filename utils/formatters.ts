export const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60)
    return 'Just now'

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit)
    if (interval >= 1)
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
  }

  return dateString
}

// Sale status chip color: settled with returns is blue, not the red of unpaid.
const saleStatusColors: Record<string, string> = {
  Paid: 'success',
  Closed_With_Returns: 'info',
  Partially_Paid: 'warning',
}

export const saleStatusColor = (status?: string) => saleStatusColors[status ?? ''] ?? 'error'

const saleStatusLabels: Record<string, string> = {
  UnPaid: 'Unpaid',
  Partially_Paid: 'Part paid',
  Paid: 'Paid',
  Closed_With_Returns: 'Closed with returns',
}

export const saleStatusLabel = (status: string) => saleStatusLabels[status] ?? status.replace(/_/g, ' ')

// Audit actions are "Controller.method" (older rows are free text): name them by the method's first word.
const actionVerbs: [RegExp, string][] = [
  [/^(all|fetch|get|show|index|me)/i, 'Viewed'],
  [/^(create|save)/i, 'Created'],
  [/^(update|mark)/i, 'Changed'],
  [/^(delete|remove|soft delete)/i, 'Archived'],
  [/^restore/i, 'Restored'],
  [/^import/i, 'Imported'],
  [/^login/i, 'Signed in'],
  [/^logout/i, 'Signed out'],
  [/^resend/i, 'Resent'],
]

export function describeAction(action: string, entity: string) {
  const method = action.includes('.') ? action.split('.').pop()! : action
  const verb = actionVerbs.find(([pattern]) => pattern.test(method))?.[1]

  if (!verb)
    return action

  return verb.startsWith('Signed') ? verb : `${verb} ${entity.replace(/_/g, ' ')}`
}

const itemStatusLabels: Record<string, string> = {
  OnSale: 'On a sale',
  OnCredit: 'On credit',
  Paid: 'Paid',
  Sold: 'Sold',
  Returned: 'Returned',
}

// A sold device's status, in words.
export const itemStatusLabel = (status: string) => itemStatusLabels[status] ?? status

// Money as the shop writes it: KES 12,300. An empty amount counts as 0.
export const kes = (amount: number | string | null | undefined) => `KES ${Number(amount || 0).toLocaleString('en-KE')}`

export const dateTime = (date: string) => new Date(date).toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

// What a permission's request method lets someone do.
const methodLabels: Record<string, string> = { GET: 'View', POST: 'Create', PUT: 'Change', PATCH: 'Change', DELETE: 'Delete' }

export const methodLabel = (method: string) => methodLabels[method] ?? method

const paymentStatuses: Record<string, { text: string; color: string }> = {
  PENDING: { text: 'Waiting for approval', color: 'warning' },
  ACCEPTED: { text: 'Accepted', color: 'success' },
  REJECTED: { text: 'Rejected', color: 'error' },
}

export const paymentStatus = (status: string) => paymentStatuses[status] ?? { text: status, color: 'default' }
