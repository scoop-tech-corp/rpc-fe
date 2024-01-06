import { useSelector } from 'react-redux';

// material-ui
import { Box, Typography } from '@mui/material';

// project import
import NavGroup from './NavGroup';
import { mappingMasterMenu } from 'menu-items'; // menuItem
import useAuth from 'hooks/useAuth';

// ==============================|| DRAWER CONTENT - NAVIGATION ||============================== //

const Navigation = () => {
  const menu = useSelector((state) => state.menu);
  const { drawerOpen } = menu;
  const { user } = useAuth();
  const get_master_menu = mappingMasterMenu(user?.masterMenu);

  // menuItem.items
  const navGroups = get_master_menu.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Fix - Navigation Group
          </Typography>
        );
    }
  });

  return <Box sx={{ pt: drawerOpen ? 2 : 0, '& > ul:first-of-type': { mt: 0 } }}>{navGroups}</Box>;
};

export default Navigation;
