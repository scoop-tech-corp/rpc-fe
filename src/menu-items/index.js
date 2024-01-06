// import standAloneMenu from './stand-alone';
// import other from './other';
import { FormattedMessage } from 'react-intl';
import {
  CalendarOutlined,
  MessageOutlined,
  FileOutlined,
  SmileOutlined,
  TeamOutlined,
  PercentageOutlined,
  SolutionOutlined,
  DollarCircleOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons';

import { LocationOn } from '@mui/icons-material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StorageIcon from '@mui/icons-material/Storage';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';

import customerMenu from './menu-customer';
import staffMenu from './menu-staff';
import promotionMenu from './menu-promotion';
import serviceMenu from './menu-service';
import productMenu from './menu-product';
import locationMenu from './menu-location';
import financeMenu from './menu-finance';
import { jsonCentralized, isContainsUppercaseForWord } from 'utils/func';

// icons
const icons = {
  DashboardIcon,
  CalendarOutlined,
  MessageOutlined,
  FileOutlined,
  SmileOutlined,
  TeamOutlined,
  PercentageOutlined,
  SolutionOutlined,
  Inventory2Icon,
  LocationOn,
  StorageIcon,
  AccessibilityNewOutlinedIcon,
  DollarCircleOutlined
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
          icon: icons['DashboardIcon']
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

export const mappingMasterMenu = (data) => {
  const get_master_menu = data ? jsonCentralized(data.items) : [];

  return get_master_menu.map((master_menu) => {
    return {
      ...master_menu,
      children: master_menu.children.map((first_child) => {
        let based_first_child = { ...first_child, title: <FormattedMessage id={first_child.title} />, icon: icons[first_child.icon] };

        if (first_child.children) {
          based_first_child = Object.assign(based_first_child, {
            children: first_child.children.map((second_child) => ({
              ...second_child,
              title: isContainsUppercaseForWord(second_child.title) ? second_child.title : <FormattedMessage id={second_child.title} />,
              icon: icons[second_child.icon]
            }))
          });
        }

        return based_first_child;
      })
    };
  });
};

const iconsProfileMenu = {
  EditOutlined,
  UserOutlined
};

export const mappingProfileMenu = (data) => {
  const get_profile_menu = data ? jsonCentralized(data.items) : [];

  return get_profile_menu.map((dt) => {
    const Icon = iconsProfileMenu[dt.icon];
    const itemIcon = iconsProfileMenu[dt.icon] ? <Icon style={{ fontSize: '1rem' }} /> : false;

    dt.icon = itemIcon;
    return dt;
  });
};

export default menuItems;
