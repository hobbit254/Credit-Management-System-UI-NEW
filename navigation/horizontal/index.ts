import type { HorizontalNavItems } from '@layouts/types'
import dashboard from '@/navigation/horizontal/dashboard'
import settings from '@/navigation/horizontal/settings'
import productManagement from '@/navigation/vertical/productManagement'

export default [...dashboard, ...settings, ...productManagement] as HorizontalNavItems
