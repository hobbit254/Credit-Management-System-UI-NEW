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
