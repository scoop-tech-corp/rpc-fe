// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TeamOutlined } from '@ant-design/icons';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import StorageIcon from '@mui/icons-material/Storage';
import { LocationOn } from '@mui/icons-material';

// icons
const icons = {
  TeamOutlined,
  LocationOn,
  StorageIcon,
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
      icon: icons.LocationOn,
      children: [
        {
          id: 'location-list',
          title: <FormattedMessage id="location-list" />,
          type: 'item',
          url: '/location/location-list',
          icon: icons.LocationOn,
          breadcrumbs: true
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
          icon: icons.StorageIcon,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default location;
