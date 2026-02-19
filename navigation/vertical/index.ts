import dashboard from './dashboard'
import settings from './settings'
import type { VerticalNavItems } from '@layouts/types'
import productManagement from '@/navigation/vertical/productManagement'
import transactions from '@/navigation/vertical/transactions'

export default [...dashboard, ...settings, ...productManagement, ...transactions] as VerticalNavItems
