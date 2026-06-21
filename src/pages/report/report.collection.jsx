import {
  AreaChartOutlined,
  AuditOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  DollarOutlined,
  FallOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  ReconciliationOutlined,
  RiseOutlined,
  TableOutlined,
  TeamOutlined,
  WarningOutlined
} from '@ant-design/icons';

export const list = {
  bookings: [
    { id: 1, val: 'By location', url: 'by-location', icon: <LineChartOutlined /> },
    { id: 2, val: 'By status', url: 'by-status', icon: <PieChartOutlined /> },
    { id: 3, val: 'By cancellation reason', url: 'by-cancellation-reason', icon: <PieChartOutlined /> },
    { id: 4, val: 'List', url: 'list', icon: <TableOutlined /> },
    { id: 6, val: 'Diagnosis list', url: 'diagnosis-list', icon: <TableOutlined /> },
    { id: 7, val: 'By diagnosis, species & gender', url: 'by-diagnosis-species-gender', icon: <BarChartOutlined /> }
  ],
  customers: [
    { id: 1, val: 'Growth', url: 'growth', icon: <RiseOutlined /> },
    { id: 2, val: 'Growth by group', url: 'growth-by-group', icon: <PieChartOutlined /> },
    { id: 3, val: 'Total', url: 'total', icon: <AreaChartOutlined /> },
    { id: 4, val: 'Leaving', url: 'leaving', icon: <FallOutlined /> },
    { id: 5, val: 'List', url: 'list', icon: <TableOutlined /> },
    { id: 6, val: 'Referral Spend', url: 'referral-spend', icon: <DollarOutlined /> },
    { id: 7, val: 'Sub Account List', url: 'sub-account-list', icon: <TeamOutlined /> }
  ],
  deposit: [
    { id: 1, val: 'Summary', url: 'summary', icon: <FileTextOutlined /> },
    { id: 2, val: 'List', url: 'list', icon: <TableOutlined /> }
  ],
  expenses: [
    { id: 1, val: 'Summary', url: 'summary', icon: <FileTextOutlined /> },
    { id: 2, val: 'List', url: 'list', icon: <TableOutlined /> }
  ],
  products: [
    { id: 1, val: 'Stock count', url: 'stock-count', icon: <DatabaseOutlined /> },
    { id: 2, val: 'Low stock', url: 'low-stock', icon: <WarningOutlined /> },
    { id: 3, val: 'No stock', url: 'no-stock', icon: <WarningOutlined /> },
    { id: 4, val: 'Batches', url: 'batches', icon: <TableOutlined /> },
    { id: 5, val: 'Expiry', url: 'expiry', icon: <ClockCircleOutlined /> },
    { id: 6, val: 'Cost', url: 'cost', icon: <DollarOutlined /> },
    { id: 7, val: 'Reminders', url: 'reminders', icon: <WarningOutlined /> }
  ],
  sales: [
    { id: 1, val: 'Summary', url: 'summary', icon: <LineChartOutlined /> },
    { id: 2, val: 'Value by item type', icon: <BarChartOutlined />, comingSoon: true },
    { id: 3, val: 'Details', url: 'details', icon: <TableOutlined /> },
    { id: 4, val: 'Items', url: 'items', icon: <TableOutlined /> },
    { id: 5, val: 'Discount summary', url: 'discount-summary', icon: <BarChartOutlined /> },
    { id: 6, val: 'Payment summary', url: 'payment-summary', icon: <PieChartOutlined /> },
    { id: 7, val: 'Payment list', url: 'payment-list', icon: <TableOutlined /> },
    { id: 8, val: 'Unpaid', url: 'unpaid', icon: <TableOutlined /> },
    { id: 9, val: 'Sales by service', url: 'by-service', icon: <BarChartOutlined /> },
    { id: 10, val: 'Sales by product', url: 'by-product', icon: <BarChartOutlined /> },
    { id: 11, val: 'Net income', url: 'net-income', icon: <BarChartOutlined /> },
    { id: 12, val: 'Package summary', icon: <FileTextOutlined />, comingSoon: true },
    { id: 13, val: 'Customer spend', icon: <DollarOutlined />, comingSoon: true },
    { id: 14, val: 'Daily reconciliation', icon: <ReconciliationOutlined />, comingSoon: true },
    { id: 15, val: 'Daily audit', url: 'daily-audit', icon: <AuditOutlined /> },
    { id: 16, val: 'Refunds', icon: <TableOutlined />, comingSoon: true },
    { id: 17, val: 'Staff Service Sales', url: 'staff-service-sales', icon: <TeamOutlined /> }
  ],
  staff: [
    { id: 1, val: 'Staff Login', url: 'login', icon: <TableOutlined /> },
    { id: 2, val: 'Staff Late', url: 'late', icon: <LineChartOutlined /> },
    { id: 3, val: 'Staff Leave', url: 'leave', icon: <LineChartOutlined /> },
    { id: 4, val: 'Staff Performance', url: 'performance', icon: <TableOutlined /> }
  ],
  // Service belum ada konten — disembunyikan dari UI via hidden:true di tab
  service: [{ id: 1, val: 'Summary', comingSoon: true }]
};

export const tab = [
  { idx: 0, id: 'all', val: 'all-reports' },
  { idx: 1, id: 'booking', val: 'booking' },
  { idx: 2, id: 'customer', val: 'customer' },
  { idx: 3, id: 'deposit', val: 'deposit' },
  { idx: 4, id: 'expenses', val: 'expenses' },
  { idx: 5, id: 'products', val: 'products' },
  { idx: 6, id: 'sales', val: 'sales' },
  { idx: 7, id: 'service', val: 'service', hidden: true }, // sembunyikan sampai ada konten
  { idx: 8, id: 'staff', val: 'staff' }
];
