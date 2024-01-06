import { useState } from 'react';

// material-ui
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { mappingProfileMenu } from 'menu-items';
import { useNavigate } from 'react-router';

import PropTypes from 'prop-types';

// assets
// import { CommentOutlined, LockOutlined, QuestionCircleOutlined, UserOutlined, UnorderedListOutlined } from '@ant-design/icons';

// ==============================|| HEADER PROFILE - SETTING TAB ||============================== //

const SettingTab = (props) => {
  const [selectedIndex, setSelectedIndex] = useState();
  const navigate = useNavigate();

  const get_setting_menu = mappingProfileMenu(props.settingMenus);

  const handleListItemClick = (index, url) => {
    setSelectedIndex(index);
    navigate(url, { replace: true });
  };

  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      {/* <ListItemButton selected={selectedIndex === 0} onClick={(event) => handleListItemClick(event, 0)}>
        <ListItemIcon>
          <QuestionCircleOutlined />
        </ListItemIcon>
        <ListItemText primary="Support" />
      </ListItemButton> */}

      {get_setting_menu.map((dt, i) => (
        <ListItemButton key={i} selected={selectedIndex === i} onClick={() => handleListItemClick(i, dt.url)}>
          <ListItemIcon>{dt.icon}</ListItemIcon>
          <ListItemText primary={<FormattedMessage id={dt.title} />} />
        </ListItemButton>
      ))}

      {/* <ListItemButton selected={selectedIndex === 1} onClick={(event) => handleListItemClick(event, 1)}>
        <ListItemIcon>
          <UserOutlined />
        </ListItemIcon>
        <ListItemText primary="Account Settings" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 2} onClick={(event) => handleListItemClick(event, 2)}>
        <ListItemIcon>
          <LockOutlined />
        </ListItemIcon>
        <ListItemText primary="Privacy Center" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 3} onClick={(event) => handleListItemClick(event, 3)}>
        <ListItemIcon>
          <CommentOutlined />
        </ListItemIcon>
        <ListItemText primary="Feedback" />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 4} onClick={(event) => handleListItemClick(event, 4)}>
        <ListItemIcon>
          <UnorderedListOutlined />
        </ListItemIcon>
        <ListItemText primary="History" />
      </ListItemButton> */}
    </List>
  );
};

SettingTab.propTypes = {
  settingMenus: PropTypes.object
};

export default SettingTab;
