import { Button, Stack, useMediaQuery, Autocomplete, TextField, Chip, Grid, Typography, Box, Skeleton } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getRefunds, getRefundSummary, exportRefunds, deleteRefund } from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefundDialog from './components/RefundDialog';

let paramList = {};

const serviceTypeOptions = [
  { label: 'Pet Clinic', value: 'Pet Clinic' },
  { label: 'Pet Hotel', value: 'Pet Hotel' },
  { label: 'Pet Salon', value: 'Pet Salon' },
  { label: 'Breeding', value: 'Breeding' },
  { label: 'Pet Shop', value: 'Pet Shop' }
];

const statusOptions = [
  { label: 'Approved', value: '1' },
  { label: 'Pending', value: '0' }
];

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatCompact = (val) => {
  const n = Number(val ?? 0);
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(2) + 'M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(2) + 'jt';
  if (n >= 1_000) return 'Rp ' + (n / 1_000).toFixed(1) + 'rb';
  return 'Rp ' + n.toLocaleString('id-ID');
};

// ── Summary Cards ────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, subLabel, color, loading }) => (
  <MainCard contentSX={{ p: 0, '&:last-child': { pb: 0 } }}>
    <Box sx={{ height: 4, bgcolor: color, borderRadius: '4px 4px 0 0' }} />
    <Stack spacing={0.25} sx={{ p: 2 }}>
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" height={14} />
          <Skeleton variant="text" width="80%" height={24} />
          <Skeleton variant="text" width="40%" height={12} />
        </>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
            {label}
          </Typography>
          <Typography variant="h5" fontWeight={700} color={color} lineHeight={1.2}>
            {value}
          </Typography>
          {subLabel && (
            <Typography variant="caption" color="text.disabled">
              {subLabel}
            </Typography>
          )}
        </>
      )}
    </Stack>
  </MainCard>
);

const FinanceRefund = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [refundData, setRefundData] = useState({ data: [], totalPagination: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterServiceType, setFilterServiceType] = useState(null);
  const [selectedFilterStatus, setFilterStatus] = useState(null);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const columns = useMemo(
    () => [
      { Header: 'No. Refund', accessor: 'refundNumber', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value ?? '-'}</span> },
      { Header: 'No. Invoice', accessor: 'invoiceNumber', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value ?? '-'}</span> },
      { Header: <FormattedMessage id="customer" />, accessor: 'customerName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: <FormattedMessage id="service-type" />,
        accessor: 'serviceType',
        Cell: (d) => {
          const colorMap = {
            'Pet Clinic': 'primary',
            'Pet Hotel': 'info',
            'Pet Salon': 'secondary',
            Breeding: 'warning',
            'Pet Shop': 'success'
          };
          return <Chip color={colorMap[d.value] ?? 'default'} label={d.value ?? '-'} size="small" variant="light" />;
        }
      },
      { Header: 'Metode Refund', accessor: 'paymentMethod' },
      {
        Header: 'Jumlah Refund',
        accessor: 'amount',
        Cell: (d) => <span style={{ color: '#c62828', fontWeight: 600 }}>{formatCurrency(d.value)}</span>
      },
      { Header: 'Alasan', accessor: 'reason', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value}</span> },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (d) =>
          d.value ? (
            <Chip color="success" label="Approved" size="small" variant="light" />
          ) : (
            <Chip color="warning" label="Pending" size="small" variant="light" />
          )
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: '',
        accessor: 'actions',
        disableSortBy: true,
        Cell: ({ row: { original } }) => (
          <IconButton size="small" color="error" title="Hapus Refund" onClick={() => handleDelete(original.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data refund ini?')) return;
    try {
      const resp = await deleteRefund(id);
      dispatch(snackbarSuccess(resp.data.message));
      fetchData();
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onOrderingChange = (event) => {
    paramList.orderValue = event.order;
    paramList.orderColumn = event.column;
    fetchData();
  };
  const onGotoPageChange = (event) => {
    paramList.goToPage = event;
    fetchData();
  };
  const onPageSizeChange = (event) => {
    paramList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramList.keyword = event;
    setKeywordSearch(event);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramList.locationId = selected.map((d) => d.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterServiceType = (selected) => {
    paramList.serviceType = selected?.value ?? '';
    setFilterServiceType(selected);
    fetchData();
  };

  const onFilterStatus = (selected) => {
    paramList.status = selected?.value ?? '';
    setFilterStatus(selected);
    fetchData();
  };

  const onStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    paramList.startDate = val;
    if (endDate) fetchData();
  };

  const onEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    paramList.endDate = val;
    if (startDate) fetchData();
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    await getRefundSummary(paramList)
      .then((r) => setSummaryData(r.data))
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  };

  const fetchData = async () => {
    fetchSummary();
    await getRefunds(paramList)
      .then((resp) => setRefundData({ data: resp.data.data, totalPagination: resp.data.totalPagination }))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearParamFetchData = () => {
    paramList = {
      rowPerPage: 10,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      serviceType: '',
      status: '',
      startDate: '',
      endDate: ''
    };
    setKeywordSearch('');
    setStartDate('');
    setEndDate('');
    setFilterLocation([]);
    setFilterServiceType(null);
    setFilterStatus(null);
  };

  const onExport = async () => {
    await exportRefunds(paramList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onRefresh = () => {
    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    getLocationList().then(setFacilityLocationList);
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sd = summaryData ?? {};

  return (
    <>
      <RefundDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSuccess={() => {
          setOpenDialog(false);
          fetchData();
        }}
      />

      <HeaderPageCustom title={<FormattedMessage id="refund" defaultMessage="Return / Refund" />} isBreadcrumb={true} />

      {/* ── Summary Cards ── */}
      <MainCard content={false} sx={{ mb: 2 }}>
        <Grid container spacing={2} sx={{ px: 3, py: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard
              label="Total Refund"
              value={(sd.totalRefunds ?? 0).toLocaleString('id-ID')}
              subLabel="semua catatan"
              color="#1565c0"
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard
              label="Total Nilai"
              value={formatCompact(sd.totalAmount)}
              subLabel="gross refund"
              color="#7b1fa2"
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard
              label="Approved"
              value={formatCompact(sd.approvedAmount)}
              subLabel={`${sd.countApproved ?? 0} refund`}
              color="#2e7d32"
              loading={summaryLoading}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <SummaryCard
              label="Pending"
              value={formatCompact(sd.pendingAmount)}
              subLabel={`${sd.countPending ?? 0} refund`}
              color="#f57f17"
              loading={summaryLoading}
            />
          </Grid>
        </Grid>
      </MainCard>

      {/* ── Table ── */}
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            <Stack
              direction={matchDownSM ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems="center"
              spacing={1}
              sx={{ p: 3, pb: 0 }}
            >
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }} flexWrap="wrap">
                <GlobalFilter
                  placeHolder={intl.formatMessage({ id: 'search' })}
                  globalFilter={keywordSearch}
                  setGlobalFilter={onSearch}
                  style={{ height: '41.3px' }}
                />
                <Autocomplete
                  multiple
                  limitTags={1}
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 230 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => onFilterLocation(v)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                <Autocomplete
                  options={serviceTypeOptions}
                  value={selectedFilterServiceType}
                  sx={{ width: 160 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => onFilterServiceType(v)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="service-type" />} />}
                />
                <Autocomplete
                  options={statusOptions}
                  value={selectedFilterStatus}
                  sx={{ width: 150 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => onFilterStatus(v)}
                  renderInput={(params) => <TextField {...params} label="Status" />}
                />
                <TextField
                  type="date"
                  size="small"
                  label={<FormattedMessage id="start-date" />}
                  value={startDate}
                  onChange={onStartDateChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 160 }}
                />
                <TextField
                  type="date"
                  size="small"
                  label={<FormattedMessage id="end-date" />}
                  value={endDate}
                  onChange={onEndDateChange}
                  InputLabelProps={{ shrink: true }}
                  sx={{ width: 160 }}
                />
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" color="primary" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
                  Catat Refund
                </Button>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
              </Stack>
            </Stack>

            <ReactTable
              columns={columns}
              data={refundData.data}
              totalPagination={refundData.totalPagination}
              setPageNumber={paramList.goToPage}
              setPageRow={paramList.rowPerPage}
              colSpanPagination={12}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>
    </>
  );
};

export default FinanceRefund;
