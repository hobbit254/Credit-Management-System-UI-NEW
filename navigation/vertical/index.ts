import type { VerticalNavItems } from '@layouts/types'

const link = (title: string, to: string, icon: string, subject: string) =>
  ({ title, to, icon: { icon }, action: 'access', subject })

export default [
  link('Overview', 'dashboard', 'tabler-layout-dashboard', 'v1/dashboard_stats'),
  link('Debtors', 'debtors', 'tabler-users', 'v1/debtors'),
  link('Sales', 'transactions', 'tabler-receipt-2', 'v1/transactions'),
  link('Payments', 'payments', 'tabler-wallet', 'v1/payments'),
  {
    title: 'Stock',
    icon: { icon: 'tabler-device-mobile' },
    children: [
      link('Devices', 'product-inventory', 'tabler-device-mobile', 'v1/product-inventory'),
      link('Products', 'products', 'tabler-package', 'v1/products'),
      link('Categories', 'categories', 'tabler-hierarchy-2', 'v1/categories'),
      link('Suppliers', 'suppliers', 'tabler-building-store', 'v1/suppliers'),
    ],
  },
  {
    title: 'Admin',
    icon: { icon: 'tabler-settings' },
    children: [
      link('Users', 'users', 'tabler-user-cog', 'v1/users'),
      link('Roles', 'roles', 'tabler-shield-check', 'v1/roles'),
      link('Permissions', 'permissions', 'tabler-key', 'v1/permissions'),
      link('Who can do what', 'permission-matrix', 'tabler-layout-grid', 'v1/permission-matrix'),
      link('Activity log', 'audit-logs', 'tabler-history', 'v1/audit_logs'),
    ],
  },
] as VerticalNavItems
