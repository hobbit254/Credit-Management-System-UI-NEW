export default [
  {
    title: 'Settings',
    icon: { icon: 'tabler-settings' },
    children: [
      {
        title: 'Roles',
        to: 'roles',
        icon: { icon: 'tabler-shield-lock', size: 20 },
      },
      {
        title: 'Permissions',
        to: 'permissions',
        icon: { icon: 'tabler-key', size: 20 },
      },
      {
        title: 'Permission Matrix',
        to: 'permission-matrix',
        icon: { icon: 'tabler-table', size: 20 },
      },
      {
        title: 'Users',
        to: 'users',
        icon: { icon: 'tabler-users-group', size: 20 },
      },
      {
        title: 'Suppliers',
        to: 'suppliers',
        icon: { icon: 'tabler-users-plus', size: 20 },
      },
      {
        title: 'Debtors',
        to: 'debtors',
        icon: { icon: 'tabler-users-group', size: 20 },
      },
    ],
  },

]
