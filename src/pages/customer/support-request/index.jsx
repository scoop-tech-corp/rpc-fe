import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, EditFilled, HistoryOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMessageBackend, detectUserPrivilage, getLocationList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import {
  getSupportRequestList,
  createSupportRequest,
  updateSupportRequest,
  deleteSupportRequest,
  getSupportRequestHistory
} from './service';
import { getCustomerList } from '../service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';

const STATUS_OPTIONS = [
  { value: 'open', labelId: 'open' },
  { value: 'in_progress', labelId: 'in-progress' },
  { value: 'closed', labelId: 'closed' }
];

const STATUS_COLORS = {
  open: 'warning',
  in_progress: 'info',
  closed: 'success'
};

const defaultForm = {
  supportRequestId: null,
  customerId: null,
  customerOption: null,
  locationId: '',
  locationOption: null,
  subject: '',
  message: '',
  status: 'open',
  notes: ''
};

let paramSupportList = {};

const CustomerSupportRequestPage = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const intl = useIntl();
  const { user } = useAuth();
  const userPrivilage = detectUserPrivilage(user?.extractMenu.masterMenu);

  const [supportData, setSupportData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [locationList, setLocationList] = useState([]);

  // modal
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [formDialog, setFormDialog] = useState(false);
  const [historyDialog, setHistoryDialog] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [formMode, setFormMode] = useState('add');
  const [formLoading, setFormLoading] = useState(false);
  const [handledByName, setHandledByName] = useState('');

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      ...(userPrivilage === 4
        ? [
            {
              title: 'Row Selection',
              Header: (header) => {
                useEffect(() => {
                  setSelectedRow(header.selectedFlatRows.map(({ original }) => original.id));
                }, [header.selectedFlatRows]);
                return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
              },
              accessor: 'selection',
              Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
              disableSortBy: true,
              style: { width: '10px' }
            }
          ]
        : []),
      { Header: <FormattedMessage id="customer" />, accessor: 'customerName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName', Cell: ({ value }) => value || '-' },
      { Header: <FormattedMessage id="subject" />, accessor: 'subject' },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: ({ value }) => (
          <Chip
            label={<FormattedMessage id={value === 'in_progress' ? 'in-progress' : value} />}
            color={STATUS_COLORS[value] || 'default'}
            size="small"
          />
        )
      },
      { Header: 'Ditangani Oleh', accessor: 'handledByName', Cell: ({ value }) => value?.trim() || '-' },
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'created_at',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString('id-ID') : '-')
      },
      {
        Header: <FormattedMessage id="resolved-at" />,
        accessor: 'resolvedAt',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString('id-ID') : '-')
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" color="info" onClick={() => onEditRow(row.original)} title="Edit">
              <EditFilled />
            </IconButton>
            <IconButton size="small" color="default" onClick={() => onOpenHistory(row.original)} title="Riwayat">
              <HistoryOutlined />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDeleteSingle(row.original.id)}>
              <DeleteFilled />
            </IconButton>
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userPrivilage, onEditRow, onOpenHistory]
  );

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const resp = await getSupportRequestList(paramSupportList);
      setSupportData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const clearParam = () => {
    paramSupportList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: '', status: '' };
    setKeywordSearch('');
    setFilterLocation('');
    setFilterStatus('');
  };

  const initList = () => {
    clearParam();
    fetchData();
  };

  // ── Fetch customers by location ───────────────────────────────────────────
  const fetchCustomersByLocation = async (locationId) => {
    if (!locationId) {
      setCustomerOptions([]);
      return;
    }
    setCustomerLoading(true);
    try {
      const resp = await getCustomerList({ rowPerPage: 0, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId });
      setCustomerOptions(
        resp.data.data.map((c) => ({
          label: [c.firstName, c.lastName].filter(Boolean).join(' ') || c.customerName,
          value: c.id
        }))
      );
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
      setCustomerOptions([]);
    } finally {
      setCustomerLoading(false);
    }
  };

  useEffect(() => {
    getLocationList().then(setLocationList);
    initList();
  }, []); // eslint-disable-line

  // Pre-load customers saat edit dialog buka
  useEffect(() => {
    if (formDialog && formMode === 'edit' && formData.locationId) {
      fetchCustomersByLocation(formData.locationId);
    }
    if (!formDialog) setCustomerOptions([]);
  }, [formDialog]); // eslint-disable-line

  // Set customerOption setelah customers ter-load
  useEffect(() => {
    if (formMode === 'edit' && formData.customerId && customerOptions.length > 0 && !formData.customerOption) {
      const found = customerOptions.find((c) => c.value === formData.customerId);
      if (found) setFormData((p) => ({ ...p, customerOption: found }));
    }
  }, [customerOptions]); // eslint-disable-line

  // ── Table handlers ────────────────────────────────────────────────────────
  const onOrderingChange = (e) => {
    paramSupportList.orderValue = e.order;
    paramSupportList.orderColumn = e.column;
    fetchData();
  };
  const onGotoPageChange = (e) => {
    paramSupportList.goToPage = e;
    fetchData();
  };
  const onPageSizeChange = (e) => {
    paramSupportList.rowPerPage = e;
    fetchData();
  };
  const onSearch = (e) => {
    paramSupportList.keyword = e;
    setKeywordSearch(e);
    fetchData();
  };
  const onFilterLocation = (e) => {
    paramSupportList.locationId = e;
    setFilterLocation(e);
    fetchData();
  };
  const onFilterStatus = (e) => {
    paramSupportList.status = e;
    setFilterStatus(e);
    fetchData();
  };

  // ── Location change di modal ──────────────────────────────────────────────
  const onModalLocationChange = (val) => {
    setFormData((p) => ({ ...p, locationOption: val, locationId: val?.value || '', customerOption: null, customerId: null }));
    fetchCustomersByLocation(val?.value || '');
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const onOpenAdd = () => {
    setFormData(defaultForm);
    setCustomerOptions([]);
    setHandledByName('');
    setFormMode('add');
    setFormDialog(true);
  };

  const onEditRow = useCallback(
    (row) => {
      setHandledByName(row.handledByName?.trim() || '');
      setFormData({
        supportRequestId: row.id,
        customerId: row.customerId,
        customerOption: null,
        locationId: row.locationId || '',
        locationOption: locationList.find((l) => l.value === row.locationId) || null,
        subject: row.subject || '',
        message: row.message || '',
        status: row.status || 'open',
        notes: ''
      });
      setFormMode('edit');
      setFormDialog(true);
    },
    [locationList]
  );

  const onDeleteSingle = (id) => {
    setSelectedRow([id]);
    setDialog(true);
  };

  const onConfirmDelete = async (value) => {
    if (!value) {
      setDialog(false);
      return;
    }
    try {
      await deleteSupportRequest(selectedRow);
      dispatch(snackbarSuccess('Success delete support request'));
      setDialog(false);
      initList();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onSubmitForm = async () => {
    if (!formData.customerId || !formData.subject || !formData.message) return;
    setFormLoading(true);
    try {
      const payload = {
        supportRequestId: formData.supportRequestId,
        customerId: formData.customerId,
        locationId: formData.locationId || null,
        subject: formData.subject,
        message: formData.message,
        status: formData.status,
        notes: formData.notes || null
      };
      if (formMode === 'add') {
        await createSupportRequest(payload);
        dispatch(snackbarSuccess('Support request created successfully'));
      } else {
        await updateSupportRequest(payload);
        dispatch(snackbarSuccess('Support request updated successfully'));
      }
      setFormDialog(false);
      initList();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setFormLoading(false);
    }
  };

  // ── History ───────────────────────────────────────────────────────────────
  const onOpenHistory = useCallback(
    async (row) => {
      setHistoryDialog(true);
      setHistoryLoading(true);
      setHistoryData([]);
      try {
        const resp = await getSupportRequestHistory(row.id);
        setHistoryData(resp.data.data || []);
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      } finally {
        setHistoryLoading(false);
      }
    },
    [dispatch]
  );

  const statusLabel = (s) => {
    if (s === 'open') return 'Terbuka';
    if (s === 'in_progress') return 'Sedang Ditangani';
    if (s === 'closed') return 'Selesai';
    return s || 'Dibuat';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <HeaderPageCustom title={intl.formatMessage({ id: 'support-requested' })} />

      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={2} sx={{ p: 2 }}>
            {/* Filter Bar */}
            <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <GlobalFilter preGlobalFilteredRows={[]} globalFilter={keywordSearch} setGlobalFilter={onSearch} size="small" />
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <Select
                    value={filterLocation}
                    label={intl.formatMessage({ id: 'location' })}
                    onChange={(e) => onFilterLocation(e.target.value)}
                  >
                    <MenuItem value="">
                      <FormattedMessage id="all" />
                    </MenuItem>
                    {locationList.map((l) => (
                      <MenuItem key={l.value} value={l.value}>
                        {l.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>
                    <FormattedMessage id="status" />
                  </InputLabel>
                  <Select
                    value={filterStatus}
                    label={intl.formatMessage({ id: 'status' })}
                    onChange={(e) => onFilterStatus(e.target.value)}
                  >
                    <MenuItem value="">
                      <FormattedMessage id="all" />
                    </MenuItem>
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <FormattedMessage id={s.labelId} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onOpenAdd} size="small">
                  <FormattedMessage id="add-support-request" />
                </Button>
                {selectedRow.length > 0 && (
                  <Button variant="contained" color="error" startIcon={<DeleteFilled />} onClick={() => setDialog(true)} size="small">
                    <FormattedMessage id="delete" /> ({selectedRow.length})
                  </Button>
                )}
              </Stack>
            </Stack>

            <ReactTable
              columns={columns}
              data={supportData.data}
              totalPagination={supportData.totalPagination}
              setPageIndex={onGotoPageChange}
              setPageSize={onPageSizeChange}
              handleOrder={onOrderingChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>

      {/* Delete Confirmation */}
      <ConfirmationC
        open={dialog}
        title={intl.formatMessage({ id: 'delete' })}
        content={intl.formatMessage({ id: 'are-you-sure-you-want-to-delete-this-data' })}
        onClose={(v) => onConfirmDelete(v)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────── */}
      <Dialog open={formDialog} onClose={() => setFormDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === 'add' ? <FormattedMessage id="add-support-request" /> : <FormattedMessage id="edit" />}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1. Location */}
            <Autocomplete
              options={locationList}
              value={formData.locationOption}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              onChange={(_, val) => onModalLocationChange(val)}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'location' })} required size="small" />}
            />

            {/* 2. Customer */}
            <Autocomplete
              options={customerOptions}
              value={formData.customerOption}
              disabled={!formData.locationId}
              loading={customerLoading}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              onChange={(_, val) => setFormData((p) => ({ ...p, customerOption: val, customerId: val?.value || null }))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={intl.formatMessage({ id: 'customer' })}
                  required
                  size="small"
                  helperText={!formData.locationId ? 'Pilih lokasi terlebih dahulu' : ''}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {customerLoading ? <CircularProgress color="inherit" size={16} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />

            {/* 3. Subject */}
            <TextField
              label={intl.formatMessage({ id: 'subject' })}
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              required
              size="small"
              fullWidth
            />

            {/* 4. Message */}
            <TextField
              label={intl.formatMessage({ id: 'message' })}
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              required
              multiline
              rows={3}
              size="small"
              fullWidth
            />

            {/* Edit-only fields */}
            {formMode === 'edit' && (
              <>
                <Divider />

                {/* 5. Status */}
                <FormControl size="small" fullWidth>
                  <InputLabel>
                    <FormattedMessage id="status" />
                  </InputLabel>
                  <Select
                    value={formData.status}
                    label={intl.formatMessage({ id: 'status' })}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <FormattedMessage id={s.labelId} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 6. HandledBy (read-only info) */}
                {handledByName && (
                  <TextField
                    label="Ditangani Oleh"
                    value={handledByName}
                    size="small"
                    fullWidth
                    InputProps={{ readOnly: true }}
                    helperText="Otomatis diisi saat status berubah ke Sedang Ditangani"
                  />
                )}

                {/* 7. Notes untuk history */}
                <TextField
                  label="Catatan Perubahan"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Opsional — dicatat di riwayat status"
                  size="small"
                  fullWidth
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(false)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={onSubmitForm}
            disabled={!formData.locationId || !formData.customerId || !formData.subject || !formData.message || formLoading}
          >
            <FormattedMessage id="save" />
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── History Dialog ────────────────────────────────────────────────── */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <HistoryOutlined />
            <span>Riwayat Pengajuan</span>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={32} />
            </Box>
          ) : historyData.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              Belum ada riwayat
            </Typography>
          ) : (
            <Stepper orientation="vertical" sx={{ mt: 1 }}>
              {historyData.map((h, idx) => (
                <Step key={h.id} active completed={idx < historyData.length - 1}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        color: STATUS_COLORS[h.toStatus] ? `${STATUS_COLORS[h.toStatus]}.main` : 'primary.main'
                      }
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {h.fromStatus && (
                        <>
                          <Chip
                            label={statusLabel(h.fromStatus)}
                            size="small"
                            color={STATUS_COLORS[h.fromStatus] || 'default'}
                            variant="outlined"
                          />
                          <Typography variant="caption">→</Typography>
                        </>
                      )}
                      <Chip label={statusLabel(h.toStatus)} size="small" color={STATUS_COLORS[h.toStatus] || 'default'} />
                    </Stack>
                  </StepLabel>
                  <StepContent>
                    <Typography variant="caption" color="text.secondary">
                      {h.changedByName?.trim() || 'System'} &bull; {h.created_at ? new Date(h.created_at).toLocaleString('id-ID') : '-'}
                    </Typography>
                    {h.notes && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {h.notes}
                      </Typography>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setHistoryDialog(false)} color="inherit">
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerSupportRequestPage;
