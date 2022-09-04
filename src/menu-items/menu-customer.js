// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { SmileOutlined } from '@ant-design/icons';

// icons
const icons = {
  SmileOutlined
};

// ==============================|| MENU ITEMS - CUSTOMER ||============================== //

const customer = {
  id: 'group-customer',
  type: 'group',
  children: [
    {
      id: 'customer',
      title: <FormattedMessage id="customer" />,
      type: 'collapse',
      icon: icons.SmileOutlined,
      children: [
        {
          id: 'customer-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/customer/dashboard',
          breadcrumbs: false
        },
        {
          id: 'customer-list',
          title: <FormattedMessage id="customer-list" />,
          type: 'item',
          url: '/customer/list'
        },
        {
          id: 'customer-template',
          title: 'Template',
          type: 'item',
          url: '/customer/template'
        },
        {
          id: 'customer-merge',
          title: <FormattedMessage id="merge" />,
          type: 'item',
          url: '/customer/merge'
        },
        {
          id: 'customer-static-data',
          title: <FormattedMessage id="static-data" />,
          type: 'item',
          url: '/customer/static-data'
        },
        {
          id: 'customer-import',
          title: <FormattedMessage id="import" />,
          type: 'item',
          url: '/customer/import'
        }
      ]
    }
  ]
};

export default customer;
