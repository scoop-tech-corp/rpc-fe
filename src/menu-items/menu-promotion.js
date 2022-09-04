// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { PercentageOutlined } from '@ant-design/icons';

// icons
const icons = {
  PercentageOutlined
};

// ==============================|| MENU ITEMS - PROMOTION ||============================== //

const promotion = {
  id: 'group-promotion',
  type: 'group',
  children: [
    {
      id: 'promotion',
      title: <FormattedMessage id="promotion" />,
      type: 'collapse',
      icon: icons.PercentageOutlined,
      children: [
        {
          id: 'promotion-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/promotion/dashboard',
          breadcrumbs: false
        },
        {
          id: 'promotion-discount',
          title: <FormattedMessage id="discount" />,
          type: 'item',
          url: '/promotion/discount'
        },
        {
          id: 'promotion-partner',
          title: <FormattedMessage id="partner" />,
          type: 'item',
          url: '/promotion/partner'
        }
      ]
    }
  ]
};

export default promotion;
