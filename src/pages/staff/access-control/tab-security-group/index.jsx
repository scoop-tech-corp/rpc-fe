/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useRef, useState } from 'react';
import { uppercaseWord } from 'utils/func';
import { ClickAwayListener, List, ListItemButton, ListItemText, Paper, Popper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import Transitions from 'components/@extended/Transitions';
import './style.css';

const TabSecurityGroup = () => {
  const [open, setOpen] = useState(false);
  const [refRow, setRefRow] = useState();
  const anchorRef = useRef(null);
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const dummyPrivilage = {
    0: 'none',
    1: 'full',
    2: 'write',
    3: 'read'
  };
  const dataDummy = {
    roles: ['administrator', 'manager', 'veterinarian', 'receptionis'],
    lists: [
      {
        module: 'Location',
        menus: [
          {
            menuId: 1,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 2,
            receptionisRef: useRef(null)
          },
          {
            menuId: 2,
            menuName: 'Location List',
            administrator: 3,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 2,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      },
      {
        module: 'Product',
        menus: [
          {
            menuId: 3,
            menuName: 'Dashboard',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          },
          {
            menuId: 4,
            menuName: 'Product List',
            administrator: 1,
            administratorRef: useRef(null),
            manager: 2,
            managerRef: useRef(null),
            veterinarian: 1,
            veterinarianRef: useRef(null),
            receptionis: 0,
            receptionisRef: useRef(null)
          }
        ]
      }
    ]
  };

  const renderContent = () => {
    dataDummy.roles;
    return (
      <>
        {dataDummy.lists.map((list) => {
          return (
            <>
              {/* create for header */}
              <tr key={list}>
                <th>{list.module}</th>
                {dataDummy.roles.map((role) => (
                  <th key={role}>{uppercaseWord(role)}</th>
                ))}
              </tr>
              {/* create for row */}
              {list.menus.map((menu, menuIdx) => (
                <tr id={menu.menuId} key={menu.menuId} className={list.menus.length - 1 === menuIdx ? 'last-row' : ''}>
                  <td>{menu.menuName}</td>
                  {dataDummy.roles.map((role) => (
                    <td
                      ref={menu[`${role}Ref`]}
                      key={role}
                      name={role}
                      onClick={(e) => {
                        console.log('roleName', e.target.getAttribute('name'));
                        console.log('menuId', e.target.parentNode.getAttribute('id'));

                        setRefRow(menu[`${role}Ref`]);
                        setOpen((prevOpen) => !prevOpen);
                      }}
                      className={`status-${dummyPrivilage[menu[role]]}`}
                    >
                      {uppercaseWord(dummyPrivilage[menu[role]])}
                    </td>
                  ))}
                </tr>
              ))}
            </>
          );
        })}

        {/* <tr>
          <th>Account</th>
          <th>Administrator</th>
          <th>Manager</th>
          <th>Veternarian</th>
          <th>Receptionist</th>
        </tr>
        <tr>
          <td>Billing</td>
          <td className="status-full">Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr>
        <tr>
          <td>Company Details</td>
          <td>Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr>
        <tr>
          <td>Notifications</td>
          <td>Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr>
        <tr className="last-row">
          <td>Signatures</td>
          <td>Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr>

        <tr>
          <th>Finance</th>
          <th>Administrator</th>
          <th>Manager</th>
          <th>Veternarian</th>
          <th>Receptionist</th>
        </tr>
        <tr>
          <td>Signatures</td>
          <td>Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr>
        <tr>
          <th>Finance</th>
          <th>Administrator</th>
          <th>Manager</th>
          <th>Veternarian</th>
          <th>Receptionist</th>
        </tr>
        <tr>
          <td>Signatures</td>
          <td>Full</td>
          <td>Write</td>
          <td>Read</td>
          <td>None</td>
        </tr> */}
      </>
    );
  };

  return (
    <>
      <div className="table-container">
        <table>{renderContent()}</table>
      </div>

      <Popper
        placement="bottom-start"
        open={open}
        anchorEl={refRow?.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [matchesXs ? 0 : 0, 9]
              }
            }
          ]
        }}
      >
        {({ TransitionProps }) => (
          <Transitions type="fade" in={open} {...TransitionProps}>
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
                    [theme.breakpoints.down('md')]: {
                      maxWidth: 500
                    }
                  }}
                >
                  <ListItemButton onClick={() => {}}>
                    <ListItemText primary={<Typography color="textPrimary">Full</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => {}}>
                    <ListItemText primary={<Typography color="textPrimary">Write</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => {}}>
                    <ListItemText primary={<Typography color="textPrimary">Read</Typography>} />
                  </ListItemButton>
                  <ListItemButton onClick={() => {}}>
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

export default TabSecurityGroup;
