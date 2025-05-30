import { BarChartOutlined, LineChartOutlined, PieChartOutlined, UnorderedListOutlined } from '@ant-design/icons';

export const list = {
  bookings: [
    {
      id: 1,
      val: 'By location',
      url: 'by-location',
      icon: <LineChartOutlined />
    },
    {
      id: 2,
      val: 'By status',
      url: 'by-status',
      icon: <PieChartOutlined />
    },
    {
      id: 3,
      val: 'By cancellation reason',
      url: 'by-cancellation-reason',
      icon: <PieChartOutlined />
    },
    {
      id: 4,
      val: 'List',
      url: 'list',
      icon: <UnorderedListOutlined />
    },
    {
      id: 6,
      val: 'Diagnosis list',
      url: 'diagnosis-list',
      icon: <UnorderedListOutlined />
    },
    {
      id: 7,
      val: 'By diagnosis, species & gender',
      url: 'by-diagnosis-species-gender',
      icon: <UnorderedListOutlined />
    }
  ],
  customers: [
    {
      id: 1,
      val: 'Growth',
      url: 'growth',
      icon: <LineChartOutlined />
    },
    {
      id: 2,
      val: 'Growth by group',
      url: 'growth-by-group',
      icon: <PieChartOutlined />
    },
    {
      id: 3,
      val: 'Total',
      url: 'total',
      icon: <LineChartOutlined />
    },
    {
      id: 4,
      val: 'Leaving',
      url: 'leaving',
      icon: <UnorderedListOutlined />
    },
    {
      id: 5,
      val: 'List',
      url: 'list',
      icon: <UnorderedListOutlined />
    },
    {
      id: 6,
      val: 'Referral Spend',
      url: 'referral-spend',
      icon: <UnorderedListOutlined />
    },
    { id: 7, val: 'Sub Account List', url: 'sub-account-list', icon: <UnorderedListOutlined /> }
  ],
  deposit: [
    { id: 1, val: 'Summary', url: 'summary', icon: <UnorderedListOutlined /> },
    { id: 2, val: 'List', url: 'list', icon: <UnorderedListOutlined /> }
  ],
  expenses: [
    { id: 1, val: 'Summary', url: 'summary', icon: <UnorderedListOutlined /> },
    { id: 2, val: 'List', url: 'list', icon: <UnorderedListOutlined /> }
  ],
  products: [
    { id: 1, val: 'Stock count', url: 'stock-count', icon: <UnorderedListOutlined /> },
    { id: 2, val: 'Low stock', url: 'low-stock', icon: <UnorderedListOutlined /> },
    { id: 3, val: 'No stock', url: 'no-stock', icon: <UnorderedListOutlined /> },
    { id: 4, val: 'Batches' },
    { id: 5, val: 'Expiry' },
    { id: 6, val: 'Cost', url: 'cost', icon: <UnorderedListOutlined /> },
    { id: 7, val: 'Reminders', url: 'reminders', icon: <UnorderedListOutlined /> }
  ],
  sales: [
    { id: 1, val: 'Summary', url: 'summary', icon: <LineChartOutlined /> },
    { id: 2, val: 'Value by item type' },
    { id: 3, val: 'Details', url: 'details', icon: <UnorderedListOutlined /> },
    { id: 4, val: 'Items', url: 'items', icon: <UnorderedListOutlined /> },
    { id: 5, val: 'Discount summary', url: 'discount-summary', icon: <BarChartOutlined /> },
    { id: 6, val: 'Payment summary', url: 'payment-summary', icon: <PieChartOutlined /> },
    { id: 7, val: 'Payment list', url: 'payment-list', icon: <UnorderedListOutlined /> },
    { id: 8, val: 'Unpaid', url: 'unpaid', icon: <UnorderedListOutlined /> },
    { id: 9, val: 'Sales by service', url: 'by-service', icon: <UnorderedListOutlined /> },
    { id: 10, val: 'Sales by product', url: 'by-product', icon: <UnorderedListOutlined /> },
    { id: 11, val: 'Net income', url: 'net-income', icon: <BarChartOutlined /> },
    { id: 12, val: 'Package summary' },
    { id: 13, val: 'Customer spend' },
    { id: 14, val: 'Daily reconciliation' },
    { id: 15, val: 'Daily audit', url: 'daily-audit', icon: <UnorderedListOutlined /> },
    { id: 16, val: 'Refunds' },
    { id: 17, val: 'Staff Service Sales', url: 'staff-service-sales', icon: <UnorderedListOutlined /> }
  ],
  staff: [
    { id: 1, val: 'Staff Login', url: 'login', icon: <UnorderedListOutlined /> },
    { id: 2, val: 'Staff Late', url: 'late', icon: <LineChartOutlined /> },
    { id: 3, val: 'Staff Leave', url: 'leave', icon: <LineChartOutlined /> },
    { id: 4, val: 'Staff Performance', url: 'performance', icon: <UnorderedListOutlined /> }
  ],
  service: [{ id: 1, val: 'Summary ' }]
};

export const tab = [
  {
    idx: 0,
    id: 'all',
    val: 'all-reports'
  },
  {
    idx: 1,
    id: 'booking',
    val: 'booking'
  },
  {
    idx: 2,
    id: 'customer',
    val: 'customer'
  },
  {
    idx: 3,
    id: 'deposit',
    val: 'deposit'
  },
  {
    idx: 4,
    id: 'expenses',
    val: 'expenses'
  },
  {
    idx: 5,
    id: 'products',
    val: 'products'
  },
  {
    idx: 6,
    id: 'sales',
    val: 'sales'
  },
  {
    idx: 7,
    id: 'service',
    val: 'service'
  },
  {
    idx: 8,
    id: 'staff',
    val: 'staff'
  }
];
