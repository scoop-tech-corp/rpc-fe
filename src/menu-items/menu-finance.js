// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DollarCircleOutlined } from '@ant-design/icons';

// icons
const icons = {
  DollarCircleOutlined
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
      icon: icons.DollarCircleOutlined,
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
          url: '/finance/sales'
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
        }
      ]
    }
  ]
};

export default finance;
