import dashboard from './dashboard'
import settings from './settings'
import type { VerticalNavItems } from '@layouts/types'
import productManagement from '@/navigation/vertical/productManagement'

export default [...dashboard, ...settings, ...productManagement] as VerticalNavItems
