import {
  Box,
  Button,
  ClickAwayListener,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Popper,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Transitions from 'components/@extended/Transitions';
import PropTypes from 'prop-types';
import useAuth from 'hooks/useAuth';
import { CONSTANT_ADMINISTRATOR, JOB_DOKTER, JOB_HELPER, JOB_KASIR, JOB_PARAMEDIS, JOB_VETNURSE, isAdminOrManager } from 'constant/role';

const TransactionDetailAction = (props) => {
  const theme = useTheme();
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const { user } = useAuth();

  const [open, setOpen] = useState(false);

  const role = user?.role;
  const jobName = user?.jobName;
  const status = props.status?.toLowerCase();

  const isAdminOrMgr = isAdminOrManager(role);
  const isAdmin = role === CONSTANT_ADMINISTRATOR;
  const isKasirOrAbove = isAdminOrMgr || jobName === JOB_KASIR;
  const isDokterOrAbove = isAdminOrMgr || jobName === JOB_DOKTER;

  const showAcceptReject = isDokterOrAbove && status === 'menunggu dokter';
  const showReassign = isKasirOrAbove && status === 'ditolak dokter';
  const showCheckCondition = isDokterOrAbove && status === 'cek kondisi pet';
  const showTreatment = isDokterOrAbove && status === 'pet check-in';
  const showPapanKerjaHarian =
    (isAdminOrMgr || [JOB_HELPER, JOB_VETNURSE, JOB_PARAMEDIS].includes(jobName)) && status === 'dalam perawatan';
  const showPapanKerjaVetnurse = (isAdminOrMgr || [JOB_VETNURSE, JOB_PARAMEDIS].includes(jobName)) && status === 'dalam perawatan';
  const showAdditionalTreatment = isDokterOrAbove && status === 'dalam perawatan';
  const showExtendStay = isKasirOrAbove && status === 'dalam perawatan';
  const showPrepayment = isKasirOrAbove && status === 'dalam perawatan';
  const showInitiateCheckout = isKasirOrAbove && status === 'dalam perawatan';
  const showCheckout = isKasirOrAbove && status === 'proses check-out';
  const showConfirmPayment = isKasirOrAbove && status === 'menunggu konfirmasi pembayaran';
  const showPrintInvoice = isKasirOrAbove && status === 'selesai';
  const showEdit = isKasirOrAbove;
  const showDelete = isAdmin;

  const hasAnyAction =
    showAcceptReject ||
    showReassign ||
    showCheckCondition ||
    showTreatment ||
    showPapanKerjaHarian ||
    showPapanKerjaVetnurse ||
    showAdditionalTreatment ||
    showExtendStay ||
    showPrepayment ||
    showInitiateCheckout ||
    showCheckout ||
    showConfirmPayment ||
    showPrintInvoice ||
    showEdit ||
    showDelete;

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleToggle = () => setOpen((prevOpen) => !prevOpen);

  if (!hasAnyAction) return null;

  return (
    <Box sx={{ ml: 2 }}>
      <Button
        variant="contained"
        ref={anchorRef}
        aria-controls={open ? 'quick-access' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <FormattedMessage id="action" />
      </Button>
      <Popper
        placement="bottom-start"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        style={{ zIndex: 1 }}
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
                  {showEdit && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('edit');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="edit" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}

                  {showAcceptReject && (
                    <>
                      <ListItemButton
                        onClick={() => {
                          props.onAction('accept-patient');
                          setOpen(false);
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography color="textPrimary">
                              <FormattedMessage id="accept-patient" />
                            </Typography>
                          }
                        />
                      </ListItemButton>
                      <ListItemButton
                        onClick={() => {
                          props.onAction('cancel-patient');
                          setOpen(false);
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography color="textPrimary">
                              <FormattedMessage id="cancel-patient" />
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </>
                  )}

                  {showReassign && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('reassign');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Reassign Dokter</Typography>} />
                    </ListItemButton>
                  )}

                  {showCheckCondition && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('check-pet-condition');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="check-pet-condition" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}

                  {showTreatment && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('treatment');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="treatment" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}

                  {showPapanKerjaHarian && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('papan-kerja-harian');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="papan-kerja-harian" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}

                  {showPapanKerjaVetnurse && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('papan-kerja-vetnurse');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="textPrimary">
                            <FormattedMessage id="papan-kerja-vetnurse" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}

                  {showAdditionalTreatment && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('additional-treatment');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Treatment Tambahan</Typography>} />
                    </ListItemButton>
                  )}

                  {showExtendStay && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('extend-stay');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Perpanjang Menginap</Typography>} />
                    </ListItemButton>
                  )}

                  {showPrepayment && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('prepayment');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Bayar DP / Pembayaran Awal</Typography>} />
                    </ListItemButton>
                  )}

                  {showInitiateCheckout && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('initiate-checkout');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="error">Inisiasi Check-Out</Typography>} />
                    </ListItemButton>
                  )}

                  {showCheckout && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('checkout');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Proses Pembayaran Check-Out</Typography>} />
                    </ListItemButton>
                  )}

                  {showConfirmPayment && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('confirm-payment');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="textPrimary">Konfirmasi Pembayaran</Typography>} />
                    </ListItemButton>
                  )}

                  {showPrintInvoice && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('print-invoice');
                        setOpen(false);
                      }}
                    >
                      <ListItemText primary={<Typography color="primary">🖨️ Cetak Struk / Invoice</Typography>} />
                    </ListItemButton>
                  )}

                  {showDelete && (
                    <ListItemButton
                      onClick={() => {
                        props.onAction('delete');
                        setOpen(false);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography color="error">
                            <FormattedMessage id="delete-transaction" />
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )}
                </List>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
};

TransactionDetailAction.propTypes = {
  onAction: PropTypes.func,
  status: PropTypes.string,
  isTreatment: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
};

export default TransactionDetailAction;
