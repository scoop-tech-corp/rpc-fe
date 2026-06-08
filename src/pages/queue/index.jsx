import { PlusOutlined, ReloadOutlined, DesktopOutlined } from '@ant-design/icons';
import {
  Box,
  Button,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import TabPanel from 'components/TabPanelC';
import { ReactTable } from 'components/third-party/ReactTable';
import { CONSTANT_ADMINISTRATOR, isAdminOrManager, JOB_DOKTER, JOB_KASIR } from 'constant/role';
import useAuth from 'hooks/useAuth';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getLocationList } from 'service/service-global';
import { getQueueList, updateQueueStatus, deleteQueue, resetQueue } from './service';
import AddQueueForm from './components/AddQueueForm';
import config from 'config';

const STATUS_TABS = [
  { value: 'waiting',    labelId: 'queue-status-waiting',    color: 'warning' },
  { value: 'called',     labelId: 'queue-status-called',     color: 'info'    },
  { value: 'in_service', labelId: 'queue-status-in-service', color: 'primary' },
  { value: 'done',       labelId: 'queue-status-done',       color: 'success' },
  { value: 'no_show',    labelId: 'queue-status-no-show',    color: 'error'   }
];

const SERVICE_COLOR = {
  'Pet Clinic': 'primary',
  'Pet Hotel':  'error',
  'Pet Salon':  'warning',
  'Breeding':   'success'
};

const DISPLAY_TOKEN = '3740adcdb33d29e3c36a31810b70deb86e212f5bbfb08b131c7c86f0db663575';

const QueueManagement = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState(0);
  const [queueData, setQueueData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalMode, setAddModalMode] = useState('walkin'); // 'walkin' | 'booking'
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // { id, status, label }

  const currentStatus = STATUS_TABS[activeTab].value;

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { status: currentStatus };
      if (selectedLocation) params.locationId = selectedLocation.value;
      const res = await getQueueList(params);
      setQueueData(res.data?.data || []);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setIsLoading(false);
    }
  }, [currentStatus, selectedLocation, dispatch]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    getLocationList().then(setLocationList);
  }, []);

  const handleStatusAction = (row, newStatus) => {
    const labelMap = {
      called:     intl.formatMessage({ id: 'queue-action-call' }),
      in_service: intl.formatMessage({ id: 'queue-action-start-service' }),
      done:       intl.formatMessage({ id: 'queue-action-done' }),
      no_show:    intl.formatMessage({ id: 'queue-action-no-show' })
    };
    setConfirmAction({ id: row.id, status: newStatus, label: labelMap[newStatus], queueNumber: row.queueNumber });
  };

  const confirmStatusChange = async () => {
    try {
      await updateQueueStatus({ id: confirmAction.id, status: confirmAction.status });
      dispatch(snackbarSuccess(intl.formatMessage({ id: 'queue-status-updated' })));
      fetchQueue();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setConfirmAction(null);
    }
  };

  const handleReset = async () => {
    if (!selectedLocation) return;
    try {
      await resetQueue(selectedLocation.value);
      dispatch(snackbarSuccess(intl.formatMessage({ id: 'queue-reset-success' })));
      fetchQueue();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setConfirmReset(false);
    }
  };

  const openDisplay = () => {
    const locationParam = selectedLocation ? `&locationId=${selectedLocation.value}` : '';
    window.open(`/queue/display?token=${DISPLAY_TOKEN}${locationParam}`, '_blank');
  };

  const columns = useMemo(() => {
    const base = [
      {
        Header: <FormattedMessage id="queue-number" />,
        accessor: 'queueNumber',
        Cell: ({ value, row }) => (
          <Chip
            label={value}
            color={SERVICE_COLOR[row.original.serviceType] || 'default'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.85rem' }}
          />
        )
      },
      {
        Header: <FormattedMessage id="service-layanan" />,
        accessor: 'serviceType'
      },
      {
        Header: <FormattedMessage id="customer-name" />,
        accessor: 'customerName'
      },
      {
        Header: <FormattedMessage id="pet-animal" />,
        accessor: 'petName'
      },
      {
        Header: <FormattedMessage id="doctor" />,
        accessor: 'doctorName',
        Cell: ({ value }) => value?.trim() || '-'
      },
      {
        Header: <FormattedMessage id="queue-chief-complaint" />,
        accessor: 'chiefComplaint',
        Cell: ({ value }) => value || '-'
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: ({ row }) => {
          const { status } = row.original;
          const canCallOrNoShow = isAdminOrManager(user?.role) || user?.jobName === JOB_KASIR || user?.jobName === JOB_DOKTER;
          const canService = isAdminOrManager(user?.role) || user?.jobName === JOB_DOKTER;

          return (
            <Stack direction="row" spacing={1}>
              {status === 'waiting' && canCallOrNoShow && (
                <Tooltip title={<FormattedMessage id="queue-action-call" />} arrow>
                  <Button size="small" variant="contained" color="info"
                    onClick={() => handleStatusAction(row.original, 'called')}>
                    <FormattedMessage id="queue-action-call" />
                  </Button>
                </Tooltip>
              )}
              {status === 'waiting' && canCallOrNoShow && (
                <Tooltip title={<FormattedMessage id="queue-action-no-show" />} arrow>
                  <Button size="small" variant="outlined" color="error"
                    onClick={() => handleStatusAction(row.original, 'no_show')}>
                    <FormattedMessage id="queue-action-no-show" />
                  </Button>
                </Tooltip>
              )}
              {status === 'called' && canService && (
                <Tooltip title={<FormattedMessage id="queue-action-start-service" />} arrow>
                  <Button size="small" variant="contained" color="primary"
                    onClick={() => handleStatusAction(row.original, 'in_service')}>
                    <FormattedMessage id="queue-action-start-service" />
                  </Button>
                </Tooltip>
              )}
              {status === 'called' && canCallOrNoShow && (
                <Tooltip title={<FormattedMessage id="queue-action-no-show" />} arrow>
                  <Button size="small" variant="outlined" color="error"
                    onClick={() => handleStatusAction(row.original, 'no_show')}>
                    <FormattedMessage id="queue-action-no-show" />
                  </Button>
                </Tooltip>
              )}
              {status === 'in_service' && canService && (
                <Tooltip title={<FormattedMessage id="queue-action-done" />} arrow>
                  <Button size="small" variant="contained" color="success"
                    onClick={() => handleStatusAction(row.original, 'done')}>
                    <FormattedMessage id="queue-action-done" />
                  </Button>
                </Tooltip>
              )}
            </Stack>
          );
        }
      }
    ];

    return base;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id="queue-management" />}
        isBreadcrumb
        action={
          <Stack direction="row" spacing={1}>
            {/* Buka Display Publik */}
            <Tooltip title={<FormattedMessage id="queue-open-display" />} arrow>
              <IconButton size="small" onClick={openDisplay}>
                <DesktopOutlined />
              </IconButton>
            </Tooltip>

            {/* Refresh */}
            <Tooltip title={<FormattedMessage id="refresh" />} arrow>
              <IconButton size="small" onClick={fetchQueue}>
                <ReloadOutlined />
              </IconButton>
            </Tooltip>

            {/* Reset antrian (admin/manager only) */}
            {isAdminOrManager(user?.role) && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                disabled={!selectedLocation}
                onClick={() => setConfirmReset(true)}
              >
                <FormattedMessage id="queue-reset" />
              </Button>
            )}

            {/* Konversi dari booking */}
            <Button
              variant="outlined"
              size="small"
              startIcon={<PlusOutlined />}
              onClick={() => { setAddModalMode('booking'); setAddModalOpen(true); }}
            >
              <FormattedMessage id="queue-from-booking" />
            </Button>

            {/* Walk-in */}
            <Button
              variant="contained"
              size="small"
              startIcon={<PlusOutlined />}
              onClick={() => { setAddModalMode('walkin'); setAddModalOpen(true); }}
            >
              <FormattedMessage id="queue-add-walkin" />
            </Button>
          </Stack>
        }
      />

      <MainCard>
        {/* Filter lokasi */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <Autocomplete
              options={locationList}
              value={selectedLocation}
              onChange={(_, v) => setSelectedLocation(v)}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              renderInput={(params) => (
                <TextField {...params} label={<FormattedMessage id="select-location" />} size="small" />
              )}
            />
          </Grid>
        </Grid>

        {/* Tabs status */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {STATUS_TABS.map((tab, idx) => (
            <Tab key={tab.value} label={<FormattedMessage id={tab.labelId} />} />
          ))}
        </Tabs>

        {STATUS_TABS.map((tab, idx) => (
          <TabPanel key={tab.value} value={activeTab} index={idx}>
            <ScrollX>
              <ReactTable
                columns={columns}
                data={queueData}
                isLoading={isLoading}
              />
            </ScrollX>
          </TabPanel>
        ))}
      </MainCard>

      {/* Modal Tambah Antrian */}
      <AddQueueForm
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => { fetchQueue(); }}
        mode={addModalMode}
      />

      {/* Konfirmasi ubah status */}
      <Dialog open={Boolean(confirmAction)} onClose={() => setConfirmAction(null)} maxWidth="xs" fullWidth>
        <DialogTitle><FormattedMessage id="confirmation" /></DialogTitle>
        <DialogContent>
          <Typography>
            <FormattedMessage
              id="queue-confirm-action"
              values={{ action: confirmAction?.label, number: <strong>{confirmAction?.queueNumber}</strong> }}
            />
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setConfirmAction(null)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" onClick={confirmStatusChange}>
            <FormattedMessage id="confirm" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* Konfirmasi reset */}
      <Dialog open={confirmReset} onClose={() => setConfirmReset(false)} maxWidth="xs" fullWidth>
        <DialogTitle><FormattedMessage id="queue-reset" /></DialogTitle>
        <DialogContent>
          <Typography><FormattedMessage id="queue-confirm-reset" /></Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={() => setConfirmReset(false)}>
            <FormattedMessage id="cancel" />
          </Button>
          <Button variant="contained" color="error" onClick={handleReset}>
            <FormattedMessage id="queue-reset" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QueueManagement;
