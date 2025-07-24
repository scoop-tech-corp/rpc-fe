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
import ListIcon from '@mui/icons-material/List';
import ForestIcon from '@mui/icons-material/Forest';
import ComputerIcon from '@mui/icons-material/Computer';
import HttpsIcon from '@mui/icons-material/Https';
import AlarmIcon from '@mui/icons-material/Alarm';
import SubtitlesIcon from '@mui/icons-material/Subtitles';
import MergeIcon from '@mui/icons-material/Merge';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import DiscountIcon from '@mui/icons-material/Discount';
import HandshakeIcon from '@mui/icons-material/Handshake';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CategoryIcon from '@mui/icons-material/Category';
import PolicyIcon from '@mui/icons-material/Policy';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RepartitionIcon from '@mui/icons-material/Repartition';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HouseIcon from '@mui/icons-material/House';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import AccessibilityNewOutlinedIcon from '@mui/icons-material/AccessibilityNewOutlined';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaidIcon from '@mui/icons-material/Paid';
import PeopleIcon from '@mui/icons-material/People';

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
  DollarCircleOutlined,
  EditOutlined,
  UserOutlined,
  ListIcon,
  ForestIcon,
  ComputerIcon,
  HttpsIcon,
  AlarmIcon,
  SubtitlesIcon,
  MergeIcon,
  ImportExportIcon,
  DiscountIcon,
  HandshakeIcon,
  VolunteerActivismIcon,
  CategoryIcon,
  PolicyIcon,
  ListAltIcon,
  RepartitionIcon,
  SwapHorizIcon,
  LocalShippingIcon,
  HouseIcon,
  RequestQuoteIcon,
  AddShoppingCartIcon,
  ReceiptIcon,
  People: PeopleIcon,
  Paid: PaidIcon
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
          id: 'transaction-menu',
          title: <FormattedMessage id="transaction" />,
          type: 'item',
          url: '/transaction',
          icon: icons.ReceiptIcon
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

export const mappingProfileMenu = (data) => {
  const get_profile_menu = data ? jsonCentralized(data.items) : [];

  return get_profile_menu.map((dt) => {
    const Icon = icons[dt.icon];
    const itemIcon = icons[dt.icon] ? <Icon style={{ fontSize: '1rem' }} /> : false;

    dt.icon = itemIcon;
    return dt;
  });
};

export default menuItems;
