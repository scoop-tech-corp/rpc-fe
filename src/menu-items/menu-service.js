// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { SolutionOutlined } from '@ant-design/icons';

// icons
const icons = {
  SolutionOutlined
};

// ==============================|| MENU ITEMS - SERVICE ||============================== //

const service = {
  id: 'group-service',
  type: 'group',
  children: [
    {
      id: 'service',
      title: <FormattedMessage id="service" />,
      type: 'collapse',
      icon: icons.SolutionOutlined,
      children: [
        {
          id: 'service-dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/service/dashboard',
          breadcrumbs: false
        },
        {
          id: 'service-list',
          title: <FormattedMessage id="service-list" />,
          type: 'item',
          url: '/service/list'
        },
        {
          id: 'service-treatment-plan',
          title: <FormattedMessage id="treatment-plan" />,
          type: 'item',
          url: '/service/treatment'
        },
        {
          id: 'service-treatment-plan',
          title: <FormattedMessage id="Service List 3" />,
          type: 'item',
          url: '/service/list-2'
        },
        {
          id: 'service-category',
          title: <FormattedMessage id="category" />,
          type: 'item',
          url: '/service/category'
        },
        {
          id: 'service-policies',
          title: <FormattedMessage id="policies" />,
          type: 'item',
          url: '/service/policies'
        },
        {
          id: 'service-template',
          title: 'Template',
          type: 'item',
          url: '/service/template'
        }
        // {
        //   id: 'service-static-data',
        //   title: <FormattedMessage id="static-data" />,
        //   type: 'item',
        //   url: '/service/static-data'
        // },
        // {
        //   id: 'service-import',
        //   title: <FormattedMessage id="import" />,
        //   type: 'item',
        //   url: '/service/import'
        // }
      ]
    }
  ]
};

export default service;
