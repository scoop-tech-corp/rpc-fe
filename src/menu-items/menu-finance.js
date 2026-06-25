// third-party
import { FormattedMessage } from 'react-intl';

// assets
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

// icons
const icons = {
  AttachMoneyIcon
};

// ==============================|| MENU ITEMS - FINANCE ||============================== //

const finance = {
  id: 'group-finance',
  type: 'group',
  children: [
    {
      id: 'finance',
      title: <FormattedMessage id="finance" />,
      type: 'collapse',
      icon: icons.AttachMoneyIcon,
      children: [
        {
          id: 'finance-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/finance/dashboard',
          breadcrumbs: false
        },
        {
          id: 'finance-sales',
          title: <FormattedMessage id="sales" />,
          type: 'item',
          url: '/finance/finance-sales'
        },
        {
          id: 'finance-payment-record',
          title: <FormattedMessage id="payment-record" defaultMessage="Payment Record" />,
          type: 'item',
          url: '/finance/payment-record'
        },
        {
          id: 'finance-piutang',
          title: <FormattedMessage id="piutang" defaultMessage="Piutang / Aging" />,
          type: 'item',
          url: '/finance/piutang'
        },
        {
          id: 'finance-refund',
          title: <FormattedMessage id="refund" defaultMessage="Return / Refund" />,
          type: 'item',
          url: '/finance/refund'
        },
        {
          id: 'finance-quotation',
          title: <FormattedMessage id="quotation" />,
          type: 'item',
          url: '/finance/quotation'
        },
        {
          id: 'finance-expenses',
          title: <FormattedMessage id="expenses" />,
          type: 'item',
          url: '/finance/expenses'
        },
        {
          id: 'finance-material-data',
          title: <FormattedMessage id="material-data" />,
          type: 'item',
          url: '/finance/material-data'
        },
        {
          id: 'finance-installment',
          title: <FormattedMessage id="installment" />,
          type: 'item',
          url: '/finance/installment'
        }
      ]
    }
  ]
};

export default finance;
