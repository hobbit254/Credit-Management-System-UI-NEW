export default [
  {
    title: 'Inventory & Catalog', // More professional group name
    icon: { icon: 'tabler-box-seam' },
    children: [
      {
        title: 'Categories',
        to: 'categories',
        icon: { icon: 'tabler-hierarchy-2', size: 20 },
      },
      {
        title: 'Products',
        to: 'products',
        icon: { icon: 'tabler-package', size: 20 },
      },
      {
        title: 'Stock Management', // More action-oriented than "Product Inventory"
        to: 'product-inventory',
        icon: { icon: 'tabler-building-warehouse', size: 20 },
      },
    ],
  },
]
