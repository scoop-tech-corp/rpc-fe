import { Button, Stack, useMediaQuery, Autocomplete, TextField, Chip, Tooltip } from '@mui/material';
import { useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getFinanceSales, exportFinanceSales, getSalesSummary } from './service';
import { useEffect } from 'react';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCardIcon from '@mui/icons-material/AddCard';
import PaymentDialog from './components/PaymentDialog';
import SummaryWidgets from './components/SummaryWidgets';

let paramSalesList = {};

const statusOptions = [
  { label: 'Paid', value: 'paid' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Partial', value: 'partial' },
  { label: 'Cancelled', value: 'cancelled' }
];

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return 'Rp ' + Number(value).toLocaleString('id-ID');
};

const ServiceChip = ({ value }) => {
  const colorMap = {
    'Pet Clinic': 'primary',
    'Pet Hotel': 'info',
    'Pet Salon': 'secondary',
    Breeding: 'warning',
    'Pet Shop': 'success'
  };
  return <Chip color={colorMap[value] ?? 'default'} label={value ?? '-'} size="small" variant="light" />;
};

const FinanceSales = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [salesData, setSalesData] = useState({ data: [], totalPagination: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterStatus, setFilterStatus] = useState(null);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentDialog, setPaymentDialog] = useState({ open: false, row: null });

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="invoice-number" />, accessor: 'invoiceNumber' },
      {
        Header: <FormattedMessage id="service-type" />,
        accessor: 'serviceType',
        Cell: (data) => <ServiceChip value={data.value} />
      },
      { Header: <FormattedMessage id="customer" />, accessor: 'customerName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="transaction-date" />, accessor: 'transactionDate' },
      { Header: <FormattedMessage id="due-date" />, accessor: 'dueDate', Cell: (data) => data.value ?? '-' },
      {
        Header: <FormattedMessage id="total" />,
        accessor: 'total',
        Cell: (data) => formatCurrency(data.value)
      },
      {
        Header: <FormattedMessage id="paid-amount" />,
        accessor: 'paidAmount',
        Cell: (data) => formatCurrency(data.value)
      },
      {
        Header: <FormattedMessage id="remaining" />,
        accessor: 'remaining',
        Cell: (data) => <span style={{ color: Number(data.value) > 0 ? '#d32f2f' : 'inherit' }}>{formatCurrency(data.value)}</span>
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (data.value) {
            case 'paid':
              return <Chip color="success" label="Paid" size="small" variant="light" />;
            case 'unpaid':
              return <Chip color="error" label="Unpaid" size="small" variant="light" />;
            case 'partial':
              return <Chip color="warning" label="Partial" size="small" variant="light" />;
            case 'cancelled':
              return <Chip color="default" label="Cancelled" size="small" variant="light" />;
            default:
              return <Chip color="default" label={data.value ?? '-'} size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: '',
        accessor: 'actions',
        disableSortBy: true,
        Cell: ({ row: { original } }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Riwayat & Detail Pembayaran">
              <span>
                <IconButton size="small" color="primary" onClick={() => setPaymentDialog({ open: true, row: original })}>
                  <ReceiptLongIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {['unpaid', 'partial'].includes(original.status) && (
              <Tooltip title="Tambah Pembayaran">
                <span>
                  <IconButton size="small" color="success" onClick={() => setPaymentDialog({ open: true, row: original })}>
                    <AddCardIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </Stack>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramSalesList.orderValue = event.order;
    paramSalesList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramSalesList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramSalesList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramSalesList.keyword = event;
    setKeywordSearch(event);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramSalesList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterStatus = (selected) => {
    paramSalesList.status = selected?.value ?? '';
    setFilterStatus(selected);
    fetchData();
  };

  const onStartDateChange = (e) => {
    const val = e.target.value;
    setStartDate(val);
    paramSalesList.startDate = val;
    if (endDate) fetchData();
  };

  const onEndDateChange = (e) => {
    const val = e.target.value;
    setEndDate(val);
    paramSalesList.endDate = val;
    if (startDate) fetchData();
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    await getSalesSummary(paramSalesList)
      .then((resp) => setSummaryData(resp.data))
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  };

  const fetchData = async () => {
    fetchSummary();
    await getFinanceSales(paramSalesList)
      .then((resp) => {
        setSalesData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearParamFetchData = () => {
    paramSalesList = {
      rowPerPage: 10,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      status: '',
      startDate: '',
      endDate: ''
    };
    setKeywordSearch('');
    setStartDate('');
    setEndDate('');
    setFilterLocation([]);
    setFilterStatus(null);
  };

  const onExport = async () => {
    await exportFinanceSales(paramSalesList)
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
    const getDataFacilityLocation = async () => {
      const data = await getLocationList();
      setFacilityLocationList(data);
    };

    getDataFacilityLocation();
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PaymentDialog
        open={paymentDialog.open}
        row={paymentDialog.row}
        onClose={() => setPaymentDialog({ open: false, row: null })}
        onSuccess={fetchData}
      />
      <HeaderPageCustom title={<FormattedMessage id="sales" />} isBreadcrumb={true} />

      {/* ── Summary Widgets ── */}
      <MainCard content={false} sx={{ mb: 2 }}>
        <SummaryWidgets data={summaryData} loading={summaryLoading} />
      </MainCard>

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
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 230 }}
                  isOptionEqualToValue={(option, val) => option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                <Autocomplete
                  id="filterStatus"
                  options={statusOptions}
                  value={selectedFilterStatus}
                  sx={{ width: 160 }}
                  isOptionEqualToValue={(option, val) => option.value === val.value}
                  onChange={(_, value) => onFilterStatus(value)}
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
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={salesData.data}
              totalPagination={salesData.totalPagination}
              setPageNumber={paramSalesList.goToPage}
              setPageRow={paramSalesList.rowPerPage}
              colSpanPagination={13}
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

export default FinanceSales;
