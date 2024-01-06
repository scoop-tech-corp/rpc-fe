import PropTypes from 'prop-types';
import { Fragment, useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';

// third-party

// project imports
import UserAvatar from './UserAvatar';
import Dot from 'components/@extended/Dot';

// assets
import { CheckOutlined } from '@ant-design/icons';
import configGlobal from '../../../config';

function UserList({ setUser, search, loginUser, listUser, userLogin }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  // const [users, setUsers] = useState([]);

  useEffect(() => {
    setData(listUser);
  }, [listUser]);

  useEffect(() => {
    if (search) {
      const result = listUser?.filter((user) => {
        return user.firstName.toLowerCase().includes(search.toLowerCase()) || user.lastName.toLowerCase().includes(search.toLowerCase());
      });
      setData(result);
    } else {
      setData(listUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const status = (user) => {
    if (user?.unreadMessageCount) {
      return <Dot color="primary" />;
    }

    if (user?.fromUserIdLastMessage == userLogin.id && user?.lastMessageIsRead == 0) {
      return <CheckOutlined style={{ color: theme.palette.grey[400] }} />;
    }

    if (user?.fromUserIdLastMessage == userLogin.id && user?.lastMessageIsRead == 1) {
      return (
        <div>
          <CheckOutlined style={{ color: theme.palette.primary.main }} />
          <CheckOutlined style={{ color: theme.palette.primary.main }} />
        </div>
      );
    }
  };
  return (
    <List component="nav">
      {data.map((user) => {
        return (
          <Fragment key={user.id}>
            <ListItemButton
              sx={{ pl: 1 }}
              onClick={() => {
                setUser(user);
              }}
            >
              <ListItemAvatar>
                <UserAvatar
                  user={{
                    ...user,
                    online_status: loginUser.find((item) => item.id === user.id) ? 'available' : '',
                    avatar: user.imagePath ? `${configGlobal.apiUrl}${user.imagePath}` : null
                  }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography
                      variant="h5"
                      color="inherit"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Typography component="span" color="textSecondary" variant="caption">
                      {user.lastMessageDate
                        ? new Date(user.lastMessageDate).toLocaleString('id-ID', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: false
                          })
                        : ''}
                    </Typography>
                  </Stack>
                }
                secondary={
                  <Stack component="span" direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '150px'
                      }}
                    >
                      {user.fromUserIdLastMessage
                        ? user.fromUserIdLastMessage == userLogin.id
                          ? 'You: '
                          : ` ${user.firstName} ${user.lastName}: `
                        : ''}
                      {user.lastMessage}
                    </Typography>
                    {status(user)}
                  </Stack>
                }
              />
            </ListItemButton>
            <Divider />
          </Fragment>
        );
      })}
    </List>
  );
}

UserList.propTypes = {
  setUser: PropTypes.func,
  search: PropTypes.string
};

export default UserList;
