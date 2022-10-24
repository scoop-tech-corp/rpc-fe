// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TeamOutlined } from '@ant-design/icons';

// icons
const icons = {
  TeamOutlined
};

// ==============================|| MENU ITEMS - LOCATION ||============================== //

const location = {
  id: 'group-location',
  type: 'group',
  children: [
    {
      id: 'location',
      title: <FormattedMessage id="location" />,
      type: 'collapse',
      icon: icons.TeamOutlined,
      children: [
        {
          id: 'location-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/location/dashboard'
        },
        {
          id: 'location-list',
          title: <FormattedMessage id="location-list" />,
          type: 'item',
          url: '/location/list',
          breadcrumbs: true
        },
        {
          id: 'location-facilities',
          title: <FormattedMessage id="facilities" />,
          type: 'item',
          url: '/location/facilities',
          breadcrumbs: false
        },
        {
          id: 'location-static-data',
          title: <FormattedMessage id="static-data" />,
          type: 'item',
          url: '/location/static-data',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default location;
