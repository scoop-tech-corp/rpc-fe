// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { DashboardOutlined, TeamOutlined } from '@ant-design/icons';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';

// icons
const icons = {
  DashboardOutlined,
  TeamOutlined,
  AccessibilityNewOutlinedIcon
};

// ==============================|| MENU ITEMS - LOCATION ||============================== //

const location = {
  id: 'group-location',
  code: 'location',
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
          url: '/location/dashboard',
          icon: icons.DashboardOutlined
        },
        {
          id: 'location-list',
          title: <FormattedMessage id="location-list" />,
          type: 'item',
          url: '/location/location-list',
          icon: icons.TeamOutlined,
          breadcrumbs: true,
          childrenPath: [{ url: '/location/add', title: <FormattedMessage id="location-add" /> }]
        },
        {
          id: 'location-facilities',
          title: <FormattedMessage id="facilities" />,
          type: 'item',
          url: '/location/facilities',
          icon: icons.AccessibilityNewOutlinedIcon,
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
