/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useRef, useState, createRef } from 'react';
import { uppercaseWord } from 'utils/func';
import { ClickAwayListener, List, ListItemButton, ListItemText, Paper, Popper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { privilageStatus, swapePrivilageStatus, updateAccessControlMenu } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import Transitions from 'components/@extended/Transitions';
import './style.css';

const TabSecurityGroup = (props) => {
  const { data } = props;

  const [openMenu, setOpenMenu] = useState({ isOpen: false, context: null });
  const [refRow, setRefRow] = useState();
  const anchorRef = useRef(null);
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();

  const coreDataList = data.lists.map((dt) => {
    const mapMenus = dt.menus.map((menu) => {
      const createRefRoles = {};
      data.roles.forEach((rl) => {
        Object.assign(createRefRoles, { [`${rl}Ref`]: createRef(null) });
      });

      return { ...menu, ...createRefRoles };
    });

    return { module: dt.module, menus: mapMenus };
  });

  const setWidthColumn = { width: `${(data.roles.length + 1) / 100}%` };

  const renderContent = () => {
    return (
      <>
        {coreDataList.map((list) => {
          return (
            <>
              {/* create for header */}
              <tr key={list}>
                <th style={setWidthColumn}>{list.module}</th>
                {data.roles.map((role) => (
                  <th key={role} style={setWidthColumn}>
                    {uppercaseWord(role)}
                  </th>
                ))}
              </tr>
              {/* create for row */}
              {list.menus.map((menu, menuIdx) => (
                <tr id={menu.menuId} key={menu.menuId} className={list.menus.length - 1 === menuIdx ? 'last-row' : ''}>
                  <td>{menu.menuName}</td>
                  {data.roles.map((role) => (
                    <td
                      ref={menu[`${role}Ref`]}
                      key={role}
                      name={role}
                      onClick={(e) => {
                        setRefRow(menu[`${role}Ref`]);
                        setOpenMenu((prevOpen) => ({
                          isOpen: !prevOpen.isOpen,
                          context: { menuId: e.target.parentNode.getAttribute('id'), roleName: e.target.getAttribute('name') }
                        }));
                      }}
                      className={`status status-${privilageStatus[menu[role]]}`}
                    >
                      {uppercaseWord(privilageStatus[menu[role]])}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          );
        })}
      </>
    );
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpenMenu({ isOpen: false, context: null });
  };

  const onClickStatus = async (status) => {
    await updateAccessControlMenu({ menuId: openMenu.context.menuId, roleName: openMenu.context.roleName, type: status })
      .then(() => {
        dispatch(snackbarSuccess('Update access control menu successfully'));

        handleClose();
        props.output('Refresh_Index');
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  return (
    <>
      <div className="table-container">
        <table>{renderContent()}</table>
      </div>

      <Popper
        placement="bottom-start"
        open={openMenu.isOpen}
        anchorEl={refRow?.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [{ name: 'offset', options: { offset: [matchesXs ? 0 : 0, 9] } }]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={openMenu.isOpen} {...TransitionProps}>
            <Paper sx={{ boxShadow: theme.customShadows.z1 }}>
              <ClickAwayListener onClickAway={handleClose}>
                <List
                  component="nav"
                  sx={{
                    p: 0,
                    width: '100%',
                    minWidth: 200,
                    maxWidth: 290,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 0.5,
                    [theme.breakpoints.down('md')]: { maxWidth: 500 }
                  }}
                >
                  <ListItemButton onClick={() => onClickStatus(swapePrivilageStatus()['full'])}>
                    <ListItemText primary={<Typography color="textPrimary">Full</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => onClickStatus(swapePrivilageStatus()['write'])}>
                    <ListItemText primary={<Typography color="textPrimary">Write</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => onClickStatus(swapePrivilageStatus()['read'])}>
                    <ListItemText primary={<Typography color="textPrimary">Read</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => onClickStatus(swapePrivilageStatus()['none'])}>
                    <ListItemText primary={<Typography color="textPrimary">None</Typography>} />
                  </ListItemButton>
                </List>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </>
  );
};

TabSecurityGroup.propTypes = {
  data: PropTypes.object,
  output: PropTypes.func
};

export default TabSecurityGroup;
