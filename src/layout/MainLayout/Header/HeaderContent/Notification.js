import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Avatar,
  Badge,
  Box,
  ClickAwayListener,
  Divider,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Popper,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { BellOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CheckOutlined } from '@ant-design/icons';

import useAuth from 'hooks/useAuth';
import { createSocketConnection } from 'service/service-socket';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from 'pages/notification/service';

const MENU_ICON = {
  petclinic:   '🏥',
  pethotel:    '🏨',
  petsalon:    '✂️',
  breeding:    '🐾',
  booking:     '📅',
  restock:     '📦',
  transfer:    '🔄',
  leave:       '🏖️',
  quotation:   '📋',
  refund:      '💸',
  installment: '💳',
  queue:       '🔢',
  feedback:    '⭐',
  support:     '🎧'
};

const TYPE_COLOR = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'primary'
};

const TYPE_ICON = {
  success: <CheckOutlined />,
  warning: <WarningOutlined />,
  error: <WarningOutlined />,
  info: <InfoCircleOutlined />
};

const actionSX = {
  mt: '6px',
  ml: 1,
  top: 'auto',
  right: 'auto',
  alignSelf: 'flex-start',
  transform: 'none'
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)} day(s) ago`;
}

const Notification = () => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications({ limit: 20 });
      setNotifications(res.data?.data ?? []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch (_) {
      // ignore fetch error — UI tetap tampil dengan data kosong
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Polling setiap 30 detik sebagai fallback
  useEffect(() => {
    const timer = setInterval(fetchNotifications, 30000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  // Real-time via WebSocket
  useEffect(() => {
    if (!user?.id) return;
    try {
      createSocketConnection();
      const channel = window.Echo.private(`notification.${user.id}`);
      channel.listen('.message-popup', () => {
        fetchNotifications();
      });
      return () => {
        window.Echo.leaveChannel(`private-notification.${user.id}`);
      };
    } catch (_) {
      // ignore socket setup error — fallback ke polling
    }
  }, [user?.id, fetchNotifications]);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (_) {
      // ignore read error
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (_) {
      // ignore mark-all-read error
    }
  };

  const iconBackColorOpen = theme.palette.mode === 'dark' ? 'grey.200' : 'grey.300';
  const iconBackColor = theme.palette.mode === 'dark' ? 'background.default' : 'grey.100';

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : iconBackColor }}
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount > 0 ? unreadCount : null} color="error">
          <BellOutlined />
        </Badge>
      </IconButton>

      <Popper
        placement={matchesXs ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
            <Paper
              sx={{
                boxShadow: theme.customShadows.z1,
                width: '100%',
                minWidth: 300,
                maxWidth: 420,
                [theme.breakpoints.down('md')]: { maxWidth: 285 }
              }}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifications"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    unreadCount > 0 && (
                      <Tooltip title="Mark all as read">
                        <IconButton color="success" size="small" onClick={handleMarkAllRead}>
                          <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      maxHeight: 400,
                      overflowY: 'auto',
                      '& .MuiListItemButton-root': {
                        py: 0.5,
                        '&.Mui-selected': { bgcolor: 'grey.50', color: 'text.primary' },
                        '& .MuiAvatar-root': { width: 36, height: 36, fontSize: '1rem' },
                        '& .MuiListItemSecondaryAction-root': { ...actionSX, position: 'relative' }
                      }
                    }}
                  >
                    {notifications.length === 0 ? (
                      <Box sx={{ py: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          No notifications
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((notif, idx) => {
                        const color = TYPE_COLOR[notif.type] || 'primary';
                        const icon = TYPE_ICON[notif.type] || <InfoCircleOutlined />;
                        const emoji = MENU_ICON[notif.menuName] || '🔔';

                        return (
                          <Box key={notif.id}>
                            <ListItemButton
                              selected={!notif.isRead}
                              onClick={() => !notif.isRead && handleRead(notif.id)}
                              sx={{ opacity: notif.isRead ? 0.65 : 1 }}
                            >
                              <ListItemAvatar>
                                <Avatar sx={{ color: `${color}.main`, bgcolor: `${color}.lighter` }}>{icon}</Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography variant="body2">
                                    <Typography component="span" sx={{ mr: 0.5 }}>
                                      {emoji}
                                    </Typography>
                                    {notif.message}
                                  </Typography>
                                }
                                secondary={
                                  <Typography variant="caption" color="text.secondary">
                                    {timeAgo(notif.created_at)}
                                  </Typography>
                                }
                              />
                              {!notif.isRead && (
                                <ListItemSecondaryAction>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main', mt: 1 }} />
                                </ListItemSecondaryAction>
                              )}
                            </ListItemButton>
                            {idx < notifications.length - 1 && <Divider />}
                          </Box>
                        );
                      })
                    )}
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

export default Notification;
