// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TeamOutlined } from '@ant-design/icons';
import Inventory2Icon from '@mui/icons-material/Inventory2';

// icons
const icons = {
  TeamOutlined,
  Inventory2Icon
};

// ==============================|| MENU ITEMS - PRODUCT ||============================== //

const product = {
  id: 'group-product',
  type: 'group',
  children: [
    {
      id: 'product',
      title: <FormattedMessage id="product" />,
      type: 'collapse',
      icon: icons.Inventory2Icon,
      children: [
        {
          id: 'product-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/product/dashboard',
          breadcrumbs: false
        },
        {
          id: 'product-list',
          title: <FormattedMessage id="product-list" />,
          type: 'item',
          url: '/product/product-list'
        },
        {
          id: 'product-bundle',
          title: <FormattedMessage id="bundle" />,
          type: 'item',
          url: '/product/bundle'
        },
        {
          id: 'product-category',
          title: <FormattedMessage id="category" />,
          type: 'item',
          url: '/product/category'
        },
        {
          id: 'product-policies',
          title: <FormattedMessage id="policies" />,
          type: 'item',
          url: '/product/policies'
        },
        {
          id: 'product-restocks',
          title: <FormattedMessage id="restocks" />,
          type: 'item',
          url: '/product/restock'
        },
        {
          id: 'product-delivery-agent',
          title: <FormattedMessage id="delivery-agent" />,
          type: 'item',
          url: '/product/delivery-agent'
        },
        {
          id: 'product-static-data',
          title: <FormattedMessage id="static-data" />,
          type: 'item',
          url: '/product/static-data'
        }
      ]
    }
  ]
};

export default product;
