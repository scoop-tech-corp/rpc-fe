import React, { useEffect, useRef, useState } from 'react';
import { Grid, TextField } from '@mui/material/';
import configGlobal from '../../config';
// material-ui
import { useTheme, styled } from '@mui/material/styles';
import { Box, ClickAwayListener, Dialog, Popper, Stack, Typography, useMediaQuery } from '@mui/material';

// third party
import Picker from 'emoji-picker-react';

import Notification from '../../assets/sound/notification.mp3';
// project import
import ChatDrawer from './chat/ChatDrawer';
import ChatHistory from './chat/ChatHistory';
import UserAvatar from './chat/UserAvatar';
import UserDetails from './chat/UserDetails';
import { dispatch } from 'store';
import { openDrawer } from 'store/reducers/menu';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import SimpleBar from 'components/third-party/SimpleBar';
import { openSnackbar, snackbarError } from 'store/reducers/snackbar';

// assets
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PaperClipOutlined,
  PictureOutlined,
  SendOutlined,
  SmileOutlined,
  SoundOutlined
} from '@ant-design/icons';

import { useSocket } from 'hooks/useSocket';
import useAuth from 'hooks/useAuth';
import { getChatHistory, getChatUser, submitMessage, readMessage } from './service';
import { useChatStore } from './chat-store';
import { createMessageBackend } from 'service/service-global';

const drawerWidth = 320;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  marginLeft: `-${drawerWidth}px`,
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

const Chat = () => {
  const theme = useTheme();

  const matchDownSM = useMediaQuery(theme.breakpoints.down('lg'));
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const [emailDetails, setEmailDetails] = useState(false);
  const [user, setUser] = useState({});
  const { user: userLogin } = useAuth();

  const [data, setData] = useState([]);

  const [tempLoginUser, setTempLoginUser] = useState({});
  const [loginUser, setLoginUser] = useState([]);
  const [listUser, setListUser] = useState([]);

  useEffect(() => {
    const { type, payload } = tempLoginUser;
    if (payload && type) {
      if (type === 'HERE') setLoginUser(payload);
      if (type === 'JOINING') setLoginUser((prev) => [...prev, payload]);
      if (type === 'LEAVING') setLoginUser((prev) => prev.filter((item) => item.id !== payload.id));
    }
  }, [tempLoginUser]);

  useEffect(() => {
    useChatStore.setState({
      openId: user.id
    });
  }, [user.id]);

  useEffect(() => {
    useChatStore.setState({
      userId: userLogin.id
    });
  }, [userLogin.id]);

  useEffect(() => {
    useChatStore.setState({
      listUser: listUser
    });
  }, [listUser]);

  useSocket({
    type: 'USER_LOGIN',
    callBack: (payload, type) => {
      console.log(payload, 'user login');
      setTempLoginUser({ type, payload });
    }
  });

  useSocket({
    type: 'CHAT',
    callBack: (payload) => {
      const message = payload.message.chat;
      const user = payload.message.user;
      const listUserFn = useChatStore.getState().listUser;
      const openId = useChatStore.getState().openId;
      const userIdPayload = useChatStore.getState().userId;

      if (payload.message.status != 'read') {
        if (message.toUserId == openId || message.fromUserId == openId) {
          setData((prev) => [...prev, { ...message }]);
        }

        if (message.toUserId != userIdPayload) {
          const sound = new Audio(Notification);
          sound.play();
        }
      }

      user.map((e) => {
        if (e.id != userIdPayload) {
          let listUserWIthoutUserId = listUserFn?.filter((item) => item.id != e.id);
          setListUser([{ ...e, unreadMessageCount: userIdPayload == message.fromUserId ? 0 : 1 }, ...listUserWIthoutUserId]);
        }
      });
    },
    userId: userLogin.id
  });

  useSocket({
    type: 'READ',
    callBack: (payload) => {
      const message = payload.message.chat;
      const user = payload.message.user;
      const listUserFn = useChatStore.getState().listUser;
      const userIdPayload = useChatStore.getState().userId;

      user.map((e) => {
        if (e.id != userIdPayload) {
          let listUserWIthoutUserId = listUserFn?.filter((item) => item.id != e.id);
          setListUser([{ ...e, unreadMessageCount: userIdPayload == message.fromUserId ? 0 : 1 }, ...listUserWIthoutUserId]);
        }
      });
    },
    userId: userLogin.id
  });

  const handleUserChange = () => {
    setEmailDetails((prev) => !prev);
  };

  const [openChatDrawer, setOpenChatDrawer] = useState(true);
  const handleDrawerOpen = () => {
    setOpenChatDrawer((prevState) => !prevState);
  };

  const [anchorElEmoji, setAnchorElEmoji] = useState();

  const handleOnEmojiButtonClick = (event) => {
    setAnchorElEmoji(anchorElEmoji ? null : event?.currentTarget);
  };

  // handle new message form
  const [message, setMessage] = useState('');
  const textInput = useRef(null);

  const handleOnSend = async () => {
    if (message.trim() === '') {
      dispatch(
        openSnackbar({
          open: true,
          message: 'Message required',
          variant: 'alert',
          alert: {
            color: 'error'
          },
          close: false
        })
      );
    } else {
      await submitMessage({
        content: message,
        toUserId: user.id
      }).catch((err) => {
        dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
    }
    setMessage('');
  };

  const handleEnter = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handleOnSend(); // Ganti ini dengan fungsi yang Anda inginkan untuk menangani Enter tanpa Shift
    }
  };

  // handle emoji
  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };

  const emojiOpen = Boolean(anchorElEmoji);
  const emojiId = emojiOpen ? 'simple-popper' : undefined;

  const handleCloseEmoji = () => {
    setAnchorElEmoji(null);
  };

  // close sidebar when widow size below 'md' breakpoint
  useEffect(() => {
    setOpenChatDrawer(!matchDownSM);
  }, [matchDownSM]);

  useEffect(() => {
    (async () => {
      if (user.id) {
        setData(await getChatHistory({ toUserId: user.id }));
        await readMessage({
          toUserId: user.id
        });
        let listUserWIthoutUserId = listUser.map((item) => {
          if (item.id == user.id) {
            return { ...item, unreadMessageCount: 0 };
          }
          return item;
        });
        setListUser(listUserWIthoutUserId);
      }
    })();
  }, [user]);

  useEffect(() => {
    dispatch(openDrawer(false));
    getChatUser().then((res) => {
      setListUser(res);
    });
  }, []);

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleFileChange(e.target.files[0]);
    input.click();
  };

  const handleFileChange = async (file) => {
    await submitMessage({
      content: message,
      toUserId: user.id,
      file
    }).catch((err) => {
      dispatch(snackbarError(createMessageBackend(err, true, true)));
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <ChatDrawer
        openChatDrawer={openChatDrawer}
        handleDrawerOpen={handleDrawerOpen}
        setUser={setUser}
        loginUser={loginUser}
        listUser={listUser}
        userLogin={userLogin}
      />
      <Main theme={theme} open={openChatDrawer}>
        <Grid container>
          <Grid item xs={12} md={emailDetails ? 8 : 12} xl={emailDetails ? 9 : 12}>
            {user.id && (
              <MainCard
                content={false}
                sx={{
                  bgcolor: theme.palette.mode === 'dark' ? 'dark.main' : 'grey.50',
                  pt: 2,
                  pl: 2,
                  borderRadius: emailDetails ? '0' : '0 4px 4px 0'
                }}
              >
                <Grid container spacing={3}>
                  <Grid
                    item
                    xs={12}
                    sx={{
                      bgcolor: theme.palette.background.paper,
                      pr: 2,
                      pb: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`
                    }}
                  >
                    <Grid container justifyContent="space-between">
                      <Grid item>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton onClick={handleDrawerOpen} color="secondary" size="large">
                            {openChatDrawer ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                          </IconButton>
                          <UserAvatar
                            user={{
                              online_status: loginUser.find((item) => item.id === user.id) ? 'available' : 'do_not_disturb',
                              avatar: user.imagePath ? `${configGlobal.apiUrl}${user.imagePath}` : null,
                              name: user.firstName + ' ' + user.lastName
                            }}
                          />
                          <Stack>
                            <Typography variant="subtitle1">{user.firstName + ' ' + user.lastName}</Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <SimpleBar
                      sx={{
                        overflowX: 'hidden',
                        height: 'calc(100vh - 410px)',
                        minHeight: 420
                      }}
                    >
                      <Box sx={{ pl: 1, pr: 3 }}>
                        <ChatHistory theme={theme} user={user} data={data} loginUser={loginUser} userLogin={userLogin} />
                      </Box>
                    </SimpleBar>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sx={{ mt: 3, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}
                  >
                    <Stack>
                      <TextField
                        inputRef={textInput}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Your Message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value.length <= 1 ? e.target.value.trim() : e.target.value)}
                        onKeyPress={handleEnter}
                        variant="standard"
                        sx={{
                          pr: 2,
                          '& .MuiInput-root:before': { borderBottomColor: theme.palette.divider }
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" sx={{ py: 2, ml: -1 }}>
                          <IconButton sx={{ opacity: 0.5 }} size="medium" color="secondary" onClick={handleFileUpload}>
                            <PictureOutlined />
                          </IconButton>
                          <Grid item>
                            <IconButton
                              ref={anchorElEmoji}
                              aria-describedby={emojiId}
                              onClick={handleOnEmojiButtonClick}
                              sx={{ opacity: 0.5 }}
                              size="medium"
                              color="secondary"
                            >
                              <SmileOutlined />
                            </IconButton>
                            <Popper
                              id={emojiId}
                              open={emojiOpen}
                              anchorEl={anchorElEmoji}
                              disablePortal
                              popperOptions={{
                                modifiers: [
                                  {
                                    name: 'offset',
                                    options: {
                                      offset: [-20, 20]
                                    }
                                  }
                                ]
                              }}
                            >
                              <ClickAwayListener onClickAway={handleCloseEmoji}>
                                <>
                                  {emojiOpen && (
                                    <div style={{ marginBottom: 110 }}>
                                      <MainCard elevation={8} content={false}>
                                        <Picker onEmojiClick={onEmojiClick} disableautoFocus />
                                      </MainCard>
                                    </div>
                                  )}
                                </>
                              </ClickAwayListener>
                            </Popper>
                          </Grid>
                        </Stack>
                        <IconButton color="primary" onClick={handleOnSend} size="large" sx={{ mr: 1.5 }}>
                          <SendOutlined />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </MainCard>
            )}
          </Grid>
          {emailDetails && !matchDownMD && (
            <Grid item xs={12} md={4} xl={3}>
              <UserDetails user={user} onClose={handleUserChange} />
            </Grid>
          )}
          {matchDownMD && (
            <Dialog onClose={handleUserChange} open={emailDetails} scroll="body">
              <UserDetails user={user} />
            </Dialog>
          )}
        </Grid>
      </Main>
    </Box>
  );
};

export default Chat;
