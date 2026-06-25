import { ThunderboltOutlined } from '@ant-design/icons';
import { Box, ClickAwayListener, List, ListItemButton, ListItemText, Paper, Popper, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Fragment, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import useAuth from 'hooks/useAuth';
import {
  CONSTANT_ADMINISTRATOR,
  CONSTANT_MANAGER,
  JOB_DOKTER,
  JOB_FINANCE,
  JOB_GROOMER,
  JOB_HELPER,
  JOB_KASIR,
  JOB_KOMISARIS,
  JOB_MANAGER_AUDIT,
  JOB_MANAGER_DE,
  JOB_MANAGER_GA,
  JOB_MANAGER_HR,
  JOB_MANAGER_PR,
  JOB_PARAMEDIS,
  JOB_PRESIDENT_DIRECTOR,
  JOB_QC_TRAINER,
  JOB_STAFF_AUDIT,
  JOB_STAFF_DE,
  JOB_STAFF_GA,
  JOB_STAFF_HR,
  JOB_STAFF_PR,
  JOB_VETNURSE
} from 'constant/role';

/**
 * Mengembalikan konfigurasi menu berdasarkan role dan jobName user.
 * jobName diperiksa lebih dulu (lebih spesifik); role hanya jadi fallback
 * ketika jobName tidak cocok dengan konfigurasi manapun.
 * Setiap item bertipe 'modal' (membuka dialog) atau 'link' (navigasi ke halaman).
 */
const getMenuConfig = (role, jobName) => {
  switch (jobName) {
    // ── Kasir ── Kelola antrian, booking & approval stok
    case JOB_KASIR:
      return [
        {
          category: 'Product',
          items: [
            { label: 'Restock Approval', type: 'modal', menuType: 'RA' },
            { label: 'Transfer Approval', type: 'modal', menuType: 'TA' }
          ]
        },
        {
          category: 'Quick Access',
          items: [
            { label: 'Queue Management', type: 'link', path: '/queue' },
            { label: 'Booking', type: 'link', path: '/booking' }
          ]
        }
      ];

    // ── Dokter Hewan ── Klinik & antrian pasien
    case JOB_DOKTER:
      return [
        {
          category: 'Transaksi',
          items: [{ label: 'Pet Clinic', type: 'link', path: '/transaction/pet-clinic' }]
        },
        {
          category: 'Queue',
          items: [{ label: 'Queue Management', type: 'link', path: '/queue' }]
        }
      ];

    // ── Paramedis & Vetnurse ── Klinik rawat-inap & hotel
    case JOB_PARAMEDIS:
    case JOB_VETNURSE:
      return [
        {
          category: 'Transaksi',
          items: [
            { label: 'Pet Clinic', type: 'link', path: '/transaction/pet-clinic' },
            { label: 'Pet Hotel', type: 'link', path: '/transaction/pet-hotel' }
          ]
        }
      ];

    // ── Helper ── Operasional hotel & kandang
    case JOB_HELPER:
      return [
        {
          category: 'Transaksi',
          items: [{ label: 'Pet Hotel', type: 'link', path: '/transaction/pet-hotel' }]
        },
        {
          category: 'Lokasi',
          items: [{ label: 'Cage Management', type: 'link', path: '/location/cage-management' }]
        }
      ];

    // ── Groomer ── Salon & antrian grooming
    case JOB_GROOMER:
      return [
        {
          category: 'Transaksi',
          items: [{ label: 'Pet Salon', type: 'link', path: '/transaction/pet-salon' }]
        },
        {
          category: 'Queue',
          items: [{ label: 'Queue Management', type: 'link', path: '/queue' }]
        }
      ];

    // ── Finance ── Kelola keuangan operasional
    case JOB_FINANCE:
      return [
        {
          category: 'Finance',
          items: [
            { label: 'Finance Sales', type: 'link', path: '/finance/finance-sales' },
            { label: 'Expenses', type: 'link', path: '/finance/expenses' },
            { label: 'Installment', type: 'link', path: '/finance/installment' },
            { label: 'Quotation', type: 'link', path: '/finance/quotation' }
          ]
        }
      ];

    // ── HR (Staff & Manager) ── SDM & jadwal karyawan
    case JOB_STAFF_HR:
    case JOB_MANAGER_HR:
      return [
        {
          category: 'Staff',
          items: [
            { label: 'Leave Approval', type: 'link', path: '/staff/leave-approval' },
            { label: 'Staff List', type: 'link', path: '/staff/list' },
            { label: 'Schedule', type: 'link', path: '/staff/schedule' }
          ]
        }
      ];

    // ── Internal Audit (Staff & Manager) ── Laporan & keuangan
    case JOB_STAFF_AUDIT:
    case JOB_MANAGER_AUDIT:
      return [
        {
          category: 'Report',
          items: [{ label: 'Report', type: 'link', path: '/report' }]
        },
        {
          category: 'Finance',
          items: [
            { label: 'Finance Sales', type: 'link', path: '/finance/finance-sales' },
            { label: 'Expenses', type: 'link', path: '/finance/expenses' }
          ]
        }
      ];

    // ── Public Relation (Staff & Manager) ── Pelanggan & promosi
    case JOB_STAFF_PR:
    case JOB_MANAGER_PR:
      return [
        {
          category: 'Customer',
          items: [
            { label: 'Customer Feedback', type: 'link', path: '/customer/feedback' },
            { label: 'Support Request', type: 'link', path: '/customer/support-request' }
          ]
        },
        {
          category: 'Promotion',
          items: [{ label: 'Discount', type: 'link', path: '/promotion/discount' }]
        }
      ];

    // ── General Affair (Staff & Manager) ── Fasilitas & absensi
    case JOB_STAFF_GA:
    case JOB_MANAGER_GA:
      return [
        {
          category: 'Lokasi',
          items: [{ label: 'Cage Management', type: 'link', path: '/location/cage-management' }]
        },
        {
          category: 'Staff',
          items: [{ label: 'Absent', type: 'link', path: '/staff/absent' }]
        }
      ];

    // ── Digital Enterprise (Staff & Manager) ── Dashboard & laporan
    case JOB_STAFF_DE:
    case JOB_MANAGER_DE:
      return [
        {
          category: 'Quick Access',
          items: [
            { label: 'Dashboard', type: 'link', path: '/dashboard' },
            { label: 'Report', type: 'link', path: '/report' }
          ]
        }
      ];

    // ── Quality Control & Trainer ── Jadwal & absensi tim
    case JOB_QC_TRAINER:
      return [
        {
          category: 'Staff',
          items: [
            { label: 'Schedule', type: 'link', path: '/staff/schedule' },
            { label: 'Absent', type: 'link', path: '/staff/absent' }
          ]
        }
      ];

    // ── President Director & Komisaris ── Overview eksekutif
    case JOB_PRESIDENT_DIRECTOR:
    case JOB_KOMISARIS:
      return [
        {
          category: 'Quick Access',
          items: [
            { label: 'Dashboard', type: 'link', path: '/dashboard' },
            { label: 'Report', type: 'link', path: '/report' }
          ]
        }
      ];

    default: {
      // Fallback: jika jobName tidak cocok, gunakan role sistem
      // Administrator & Manager tanpa jobName spesifik → akses penuh approval
      const isAdminOrMgr = [CONSTANT_ADMINISTRATOR, CONSTANT_MANAGER].includes(role);
      if (isAdminOrMgr) {
        return [
          {
            category: 'Product',
            items: [
              { label: 'Inventory Approval', type: 'modal', menuType: 'IA' },
              { label: 'Restock Approval', type: 'modal', menuType: 'RA' },
              { label: 'Transfer Approval', type: 'modal', menuType: 'TA' }
            ]
          },
          {
            category: 'Staff',
            items: [{ label: 'Leave Approval', type: 'link', path: '/staff/leave-approval' }]
          }
        ];
      }
      return [];
    }
  }
};

// ==============================|| QUICK MENU ||============================== //

const QuickMenu = (props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuConfig = useMemo(() => getMenuConfig(user?.role, user?.jobName), [user]);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleItemClick = (item) => {
    if (item.type === 'modal') {
      props.onQuickMenuOpen({ menuType: item.menuType, isOpen: true });
    } else {
      navigate(item.path);
    }
    setOpen(false);
  };

  const titleListItemStyle = {
    cursor: 'default',
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    paddingTop: '2px',
    paddingBottom: '2px'
  };

  const subListItemStyle = {
    paddingLeft: '30px'
  };

  // Tidak tampilkan icon jika tidak ada menu untuk role/job ini
  if (!menuConfig.length) return null;

  return (
    <>
      <Box sx={{ flexShrink: 0, ml: 1 }}>
        <IconButton
          color="secondary"
          variant="light"
          sx={{ color: 'text.primary' }}
          aria-label="open quick access"
          ref={anchorRef}
          aria-controls={open ? 'quick-access' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <ThunderboltOutlined />
        </IconButton>
        <Popper
          placement="bottom-start"
          open={open}
          anchorEl={anchorRef.current}
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
                    {menuConfig.map((group) => (
                      <Fragment key={group.category}>
                        <ListItemButton style={titleListItemStyle} disableRipple>
                          <ListItemText
                            primary={
                              <Typography color="textPrimary" style={{ fontWeight: 'bold' }}>
                                {group.category}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                        {group.items.map((item) => (
                          <ListItemButton key={item.label} style={subListItemStyle} onClick={() => handleItemClick(item)}>
                            <ListItemText primary={<Typography color="textPrimary">{item.label}</Typography>} />
                          </ListItemButton>
                        ))}
                      </Fragment>
                    ))}
                  </List>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      </Box>
    </>
  );
};

QuickMenu.propTypes = {
  onQuickMenuOpen: PropTypes.func
};

export default QuickMenu;
