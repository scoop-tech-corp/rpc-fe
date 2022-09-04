// import standAloneMenu from './stand-alone';
// import other from './other';
import { FormattedMessage } from 'react-intl';
import { DashboardOutlined, CalendarOutlined, MessageOutlined, FileOutlined } from '@ant-design/icons';
import customerMenu from './menu-customer';
import staffMenu from './menu-staff';
import promotionMenu from './menu-promotion';
import serviceMenu from './menu-service';
import productMenu from './menu-product';
import locationMenu from './menu-location';
import financeMenu from './menu-finance';

// icons
const icons = {
  DashboardOutlined,
  CalendarOutlined,
  MessageOutlined,
  FileOutlined
};

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [
    {
      id: 'menu-group-1',
      type: 'group',
      children: [
        {
          id: 'dashboard-menu',
          title: <FormattedMessage id="dashboard" />,
          type: 'item',
          url: '/dashboard',
          breadcrumbs: false,
          icon: icons.DashboardOutlined
        },
        {
          id: 'calendar-menu',
          title: <FormattedMessage id="calendar" />,
          type: 'item',
          url: '/calendar',
          icon: icons.CalendarOutlined
        },
        {
          id: 'message-menu',
          title: <FormattedMessage id="message" />,
          type: 'item',
          url: '/message',
          icon: icons.MessageOutlined
        }
      ]
    },
    customerMenu,
    staffMenu,
    promotionMenu,
    serviceMenu,
    productMenu,
    locationMenu,
    financeMenu,
    {
      id: 'menu-group-2',
      type: 'group',
      children: [
        {
          id: 'report-menu',
          title: <FormattedMessage id="report" />,
          type: 'item',
          url: '/report',
          breadcrumbs: false,
          icon: icons.FileOutlined
        }
      ]
    }
  ]
};

export default menuItems;
