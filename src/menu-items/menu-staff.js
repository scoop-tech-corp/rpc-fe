// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { TeamOutlined } from '@ant-design/icons';

// icons
const icons = {
  TeamOutlined
};

// ==============================|| MENU ITEMS - STAFF ||============================== //

const staff = {
  id: 'group-staff',
  type: 'group',
  children: [
    {
      id: 'staff',
      title: <FormattedMessage id="staff" />,
      type: 'collapse',
      icon: icons.TeamOutlined,
      children: [
        {
          id: 'staff-list',
          title: <FormattedMessage id="staff-list" />,
          type: 'item',
          url: '/staff/list'
        },
        {
          id: 'staff-leave-approval',
          title: <FormattedMessage id="leave-approval" />,
          type: 'item',
          url: '/staff/leave-approval'
        },
        {
          id: 'staff-access-control',
          title: <FormattedMessage id="access-control" />,
          type: 'item',
          url: '/staff/access-control'
        },
        {
          id: 'staff-security-group',
          title: <FormattedMessage id="security-group" />,
          type: 'item',
          url: '/staff/security-group'
        },
        {
          id: 'staff-schedule',
          title: <FormattedMessage id="schedule" />,
          type: 'item',
          url: '/staff/schedule'
        },
        {
          id: 'staff-static-data',
          title: <FormattedMessage id="static-data" />,
          type: 'item',
          url: '/staff/static-data'
        }
      ]
    }
  ]
};

export default staff;
