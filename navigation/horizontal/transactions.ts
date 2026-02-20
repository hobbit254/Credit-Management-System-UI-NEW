export default [
  {
    title: 'Financials', // Grouped under a broader category
    icon: { icon: 'tabler-report-money' },
    children: [
      {
        title: 'Transactions',
        to: 'transactions',
        icon: { icon: 'tabler-receipt-2', size: 20 },
      },
      {
        title: 'Payments',
        to: 'payments',
        icon: { icon: 'tabler-wallet', size: 20 },
      },
    ],
  },
]
