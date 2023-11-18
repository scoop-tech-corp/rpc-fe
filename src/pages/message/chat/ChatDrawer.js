import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Drawer,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Stack,
  Typography,
  useMediaQuery
} from '@mui/material';

// project imports
import UserAvatar from './UserAvatar';
import UserList from './UserList';
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
// assets
import {
  CheckCircleFilled,
  ClockCircleFilled,
  LogoutOutlined,
  MinusCircleFilled,
  RightOutlined,
  SearchOutlined,
  SettingOutlined
} from '@ant-design/icons';

// ==============================|| CHAT DRAWER ||============================== //

function ChatDrawer({ handleDrawerOpen, openChatDrawer, setUser, loginUser, listUser, userLogin }) {
  const theme = useTheme();
  const { user } = useAuth();

  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const drawerBG = theme.palette.mode === 'dark' ? 'dark.main' : 'white';

  // show menu to set current user status
  const [anchorEl, setAnchorEl] = useState();
  const handleClickRightMenu = (event) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleCloseRightMenu = () => {
    setAnchorEl(null);
  };

  // set user status on status menu click
  const [status, setStatus] = useState('available');
  const handleRightMenuItemClick = (userStatus) => () => {
    setStatus(userStatus);
    handleCloseRightMenu();
  };

  const [search, setSearch] = useState('');
  const handleSearch = async (event) => {
    const newString = event?.target.value;
    setSearch(newString);
  };

  return (
    <Drawer
      sx={{
        width: 320,
        flexShrink: 0,
        zIndex: { xs: 1100, lg: 0 },
        '& .MuiDrawer-paper': {
          height: matchDownLG ? '100%' : 'auto',
          width: 320,
          boxSizing: 'border-box',
          position: 'relative',
          border: 'none'
        }
      }}
      variant={matchDownLG ? 'temporary' : 'persistent'}
      anchor="left"
      open={openChatDrawer}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {openChatDrawer && (
        <MainCard
          sx={{
            bgcolor: matchDownLG ? 'transparent' : drawerBG,
            borderRadius: '4px 0 0 4px',
            borderRight: 'none'
          }}
          border={!matchDownLG}
          content={false}
        >
          <Box sx={{ p: 3, pb: 1 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography variant="h5" color="inherit">
                  Messages
                </Typography>
                <Chip
                  label={listUser?.filter((item) => item?.unreadMessageCount).length}
                  component="span"
                  color="secondary"
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    '& .MuiChip-label': {
                      px: 0.5
                    }
                  }}
                />
              </Stack>

              <OutlinedInput
                fullWidth
                id="input-search-header"
                placeholder="Search"
                value={search}
                onChange={handleSearch}
                sx={{
                  '& .MuiOutlinedInput-input': {
                    p: '10.5px 0px 12px',
                    color: 'darkgray'
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchOutlined style={{ fontSize: 'small' }} />
                  </InputAdornment>
                }
              />
            </Stack>
          </Box>

          <SimpleBar
            sx={{
              overflowX: 'hidden',
              height: matchDownLG ? 'calc(100vh - 120px)' : 'calc(100vh - 220px)',
              minHeight: matchDownLG ? 0 : 420
            }}
          >
            <Box sx={{ p: 3, pt: 0 }}>
              <UserList setUser={setUser} search={search} loginUser={loginUser} listUser={listUser} userLogin={userLogin} />
            </Box>
          </SimpleBar>
        </MainCard>
      )}
    </Drawer>
  );
}

ChatDrawer.propTypes = {
  handleDrawerOpen: PropTypes.func,
  openChatDrawer: PropTypes.bool,
  setUser: PropTypes.func
};

export default ChatDrawer;
