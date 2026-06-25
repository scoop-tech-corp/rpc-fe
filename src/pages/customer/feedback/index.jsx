import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, EditFilled, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMessageBackend, detectUserPrivilage, getLocationList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import { getFeedbackList, createFeedback, updateFeedback, deleteFeedback } from './service';
import { getCustomerList } from '../service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import useAuth from 'hooks/useAuth';

const TRANSACTION_TYPES = ['Pet Clinic', 'Pet Hotel', 'Pet Salon', 'Breeding', 'Pet Shop'];

const defaultForm = {
  feedbackId: null,
  customerId: null,
  customerOption: null,
  locationId: '',
  locationOption: null,
  transactionType: '',
  rating: 0,
  message: ''
};

let paramFeedbackList = {};

const CustomerFeedbackPage = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const intl = useIntl();
  const { user } = useAuth();
  const userPrivilage = detectUserPrivilage(user?.extractMenu?.masterMenu);

  const [feedbackData, setFeedbackData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [locationList, setLocationList] = useState([]);

  // modal state
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [formDialog, setFormDialog] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [formMode, setFormMode] = useState('add');
  const [formLoading, setFormLoading] = useState(false);

  // ── Columns ──────────────────────────────────────────────────────────────
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
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="transaction-type" />, accessor: 'transactionType', Cell: ({ value }) => value || '-' },
      {
        Header: <FormattedMessage id="rating" />,
        accessor: 'rating',
        Cell: ({ value }) => <Rating value={Number(value)} readOnly size="small" />
      },
      { Header: <FormattedMessage id="message" />, accessor: 'message', Cell: ({ value }) => value || '-' },
      {
        Header: <FormattedMessage id="date" />,
        accessor: 'created_at',
        Cell: ({ value }) => (value ? new Date(value).toLocaleDateString('id-ID') : '-')
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        disableSortBy: true,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <IconButton size="small" color="info" onClick={() => onEditRow(row.original)}>
              <EditFilled />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDeleteSingle(row.original.id)}>
              <DeleteFilled />
            </IconButton>
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userPrivilage]
  );

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const resp = await getFeedbackList(paramFeedbackList);
      setFeedbackData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const clearParam = () => {
    paramFeedbackList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: '' };
    setKeywordSearch('');
    setFilterLocation('');
  };

  const initList = () => {
    clearParam();
    fetchData();
  };

  // Fetch customers by locationId
  const fetchCustomersByLocation = async (locationId) => {
    if (!locationId) {
      setCustomerOptions([]);
      return;
    }
    setCustomerLoading(true);
    try {
      const resp = await getCustomerList({
        rowPerPage: 0,
        goToPage: 1,
        orderValue: '',
        orderColumn: '',
        keyword: '',
        locationId
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When dialog opens for edit, pre-load customers for the existing location
  useEffect(() => {
    if (formDialog && formMode === 'edit' && formData.locationId) {
      fetchCustomersByLocation(formData.locationId);
    }
    if (!formDialog) {
      setCustomerOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDialog]);

  // ── Table event handlers ───────────────────────────────────────────────────
  const onOrderingChange = (e) => {
    paramFeedbackList.orderValue = e.order;
    paramFeedbackList.orderColumn = e.column;
    fetchData();
  };
  const onGotoPageChange = (e) => {
    paramFeedbackList.goToPage = e;
    fetchData();
  };
  const onPageSizeChange = (e) => {
    paramFeedbackList.rowPerPage = e;
    fetchData();
  };
  const onSearch = (e) => {
    paramFeedbackList.keyword = e;
    setKeywordSearch(e);
    fetchData();
  };
  const onFilterLocation = (e) => {
    paramFeedbackList.locationId = e;
    setFilterLocation(e);
    fetchData();
  };

  // ── Location change inside modal ──────────────────────────────────────────
  const onModalLocationChange = (val) => {
    setFormData((p) => ({
      ...p,
      locationOption: val,
      locationId: val?.value || '',
      // reset customer when location changes
      customerOption: null,
      customerId: null
    }));
    fetchCustomersByLocation(val?.value || '');
  };

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const onOpenAdd = () => {
    setFormData(defaultForm);
    setCustomerOptions([]);
    setFormMode('add');
    setFormDialog(true);
  };

  const onEditRow = (row) => {
    setFormData({
      feedbackId: row.id,
      customerId: row.customerId,
      customerOption: null, // will be set after customers load
      locationId: row.locationId || '',
      locationOption: locationList.find((l) => l.value === row.locationId) || null,
      transactionType: row.transactionType || '',
      rating: Number(row.rating),
      message: row.message || ''
    });
    setFormMode('edit');
    setFormDialog(true);
  };

  // After customers load in edit mode, set the customerOption
  useEffect(() => {
    if (formMode === 'edit' && formData.customerId && customerOptions.length > 0 && !formData.customerOption) {
      const found = customerOptions.find((c) => c.value === formData.customerId);
      if (found) setFormData((p) => ({ ...p, customerOption: found }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerOptions]);

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
      await deleteFeedback(selectedRow);
      dispatch(snackbarSuccess('Success delete feedback'));
      setDialog(false);
      initList();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onSubmitForm = async () => {
    if (!formData.customerId || !formData.rating) return;
    setFormLoading(true);
    try {
      const payload = {
        feedbackId: formData.feedbackId,
        customerId: formData.customerId,
        locationId: formData.locationId || null,
        transactionType: formData.transactionType || null,
        rating: formData.rating,
        message: formData.message || null
      };

      if (formMode === 'add') {
        await createFeedback(payload);
        dispatch(snackbarSuccess('Feedback added successfully'));
      } else {
        await updateFeedback(payload);
        dispatch(snackbarSuccess('Feedback updated successfully'));
      }
      setFormDialog(false);
      initList();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setFormLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <HeaderPageCustom title={intl.formatMessage({ id: 'feedback' })} />

      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={2} sx={{ p: 2 }}>
            {/* Filter Bar */}
            <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} justifyContent="space-between" alignItems="flex-start">
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <GlobalFilter globalFilter={keywordSearch} setGlobalFilter={onSearch} size="small" />
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
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onOpenAdd} size="small">
                  <FormattedMessage id="add-feedback" />
                </Button>
                {selectedRow.length > 0 && (
                  <Button variant="contained" color="error" startIcon={<DeleteFilled />} onClick={() => setDialog(true)} size="small">
                    <FormattedMessage id="delete" /> ({selectedRow.length})
                  </Button>
                )}
              </Stack>
            </Stack>

            {/* Table */}
            <ReactTable
              columns={columns}
              data={feedbackData.data}
              totalPagination={feedbackData.totalPagination}
              setPageNumber={paramFeedbackList.goToPage}
              setPageRow={paramFeedbackList.rowPerPage}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
              onOrder={onOrderingChange}
              colSpanPagination={8}
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

      {/* Add / Edit Dialog */}
      <Dialog open={formDialog} onClose={() => setFormDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === 'add' ? <FormattedMessage id="add-feedback" /> : <FormattedMessage id="edit" />}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1. Location — pilih dulu */}
            <Autocomplete
              options={locationList}
              value={formData.locationOption}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              onChange={(_, val) => onModalLocationChange(val)}
              renderInput={(params) => <TextField {...params} label={intl.formatMessage({ id: 'location' })} required size="small" />}
            />

            {/* 2. Customer — aktif setelah lokasi dipilih */}
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
                  helperText={!formData.locationId ? intl.formatMessage({ id: 'choose-location-first' }) : ''}
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

            {/* 3. Transaction Type */}
            <FormControl size="small" fullWidth>
              <InputLabel>
                <FormattedMessage id="transaction-type" />
              </InputLabel>
              <Select
                value={formData.transactionType}
                label={intl.formatMessage({ id: 'transaction-type' })}
                onChange={(e) => setFormData((p) => ({ ...p, transactionType: e.target.value }))}
              >
                <MenuItem value="">
                  <FormattedMessage id="none" />
                </MenuItem>
                {TRANSACTION_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 4. Rating */}
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                <FormattedMessage id="rating" /> *
              </Typography>
              <br />
              <Rating value={formData.rating} onChange={(_, val) => setFormData((p) => ({ ...p, rating: val || 0 }))} size="large" />
            </Box>

            {/* 5. Message */}
            <TextField
              label={intl.formatMessage({ id: 'message' })}
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              multiline
              rows={3}
              size="small"
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(false)} color="inherit">
            <FormattedMessage id="cancel" />
          </Button>
          <Button
            variant="contained"
            onClick={onSubmitForm}
            disabled={!formData.locationId || !formData.customerId || !formData.rating || formLoading}
          >
            <FormattedMessage id="save" />
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CustomerFeedbackPage;
