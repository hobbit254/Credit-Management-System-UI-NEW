import dashboard from './dashboard'
import settings from './settings'
import type { VerticalNavItems } from '@layouts/types'

export default [...dashboard, ...settings] as VerticalNavItems
