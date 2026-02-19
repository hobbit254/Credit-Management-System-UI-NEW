import type { HorizontalNavItems } from '@layouts/types'
import dashboard from '@/navigation/horizontal/dashboard'
import settings from '@/navigation/horizontal/settings'
import productManagement from '@/navigation/horizontal/productManagement'
import transactions from '@/navigation/horizontal/transactions'

export default [...dashboard, ...settings, ...productManagement, ...transactions] as HorizontalNavItems
