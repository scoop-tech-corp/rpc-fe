import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

// assets
import { LogoutOutlined } from '@ant-design/icons'; // ProfileOutlined, WalletOutlined, EditOutlined, UserOutlined
import { useNavigate } from 'react-router';
import { mappingProfileMenu } from 'menu-items';

import useAuth from 'hooks/useAuth';
import { FormattedMessage } from 'react-intl';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

const ProfileTab = ({ handleLogout }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const get_profile_menu = mappingProfileMenu(user?.profileMenu);

  const onClickProfile = (data, i) => {
    setSelectedIndex(i);
    let url = `${data.url}`;
    const title = String(data.title).toLowerCase();
    if (title.includes('profile')) url = `${data.url}/${user.id}`;

    navigate(url, { replace: true });
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {get_profile_menu.map((dt, i) => (
        <ListItemButton key={i} selected={selectedIndex === i} onClick={() => onClickProfile(dt, i)}>
          <ListItemIcon>{dt.icon}</ListItemIcon>
          <ListItemText primary={<FormattedMessage id={dt.title} />} />
        </ListItemButton>
      ))}

      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
};

ProfileTab.propTypes = {
  handleLogout: PropTypes.func
};

export default ProfileTab;
