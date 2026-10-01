export default [
  {
    title: 'Access Control', // Focused on security & structure
    icon: { icon: 'tabler-lock-access' },
    children: [
      {
        title: 'Roles & Rankings',
        to: 'roles',
        icon: { icon: 'tabler-shield-check', size: 20 },
        action: 'access',
        subject: 'v1/roles',
      },
      {
        title: 'Permissions',
        to: 'permissions',
        icon: { icon: 'tabler-key', size: 20 },
        action: 'access',
        subject: 'v1/permissions',
      },
      {
        title: 'Security Matrix',
        to: 'permission-matrix',
        icon: { icon: 'tabler-layout-grid', size: 20 },
        action: 'access',
        subject: 'v1/permission-matrix',
      },
      {
        title: 'User Management',
        to: 'users',
        icon: { icon: 'tabler-user-cog', size: 20 },
        action: 'access',
        subject: 'v1/users',
      },
    ],
  },
  {
    title: 'Activity Monitoring', // New section for system transparency
    icon: { icon: 'tabler-activity' },
    children: [
      {
        title: 'Audit Logs',
        to: 'audit-logs',
        icon: { icon: 'tabler-receipt-search', size: 20 },
        action: 'access',
        subject: 'v1/audit_logs',
      },
    ],
  },
  {
    title: 'Directory', // Focused on external entities
    icon: { icon: 'tabler-address-book' },
    children: [
      {
        title: 'Suppliers',
        to: 'suppliers',
        icon: { icon: 'tabler-building-store', size: 20 },
        action: 'access',
        subject: 'v1/suppliers',
      },
      {
        title: 'Debtors',
        to: 'debtors',
        icon: { icon: 'tabler-coin', size: 20 },
        action: 'access',
        subject: 'v1/debtors',
      },
    ],
  },
]
