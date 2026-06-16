import { Button, Stack, useMediaQuery, Autocomplete, TextField, Chip } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getPaymentRecords, exportPaymentRecords, getPaymentMethods } from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';

let paramList = {};

const serviceTypeOptions = [
  { label: 'Pet Clinic', value: 'Pet Clinic' },
  { label: 'Pet Hotel', value: 'Pet Hotel' },
  { label: 'Pet Salon', value: 'Pet Salon' },
  { label: 'Breeding', value: 'Breeding' },
  { label: 'Pet Shop', value: 'Pet Shop' }
];

const statusOptions = [
  { label: 'Confirmed', value: '1' },
  { label: 'Pending', value: '0' }
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

const FinancePaymentRecord = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [recordData, setRecordData] = useState({ data: [], totalPagination: 0 });
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [paymentMethodList, setPaymentMethodList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterMethod, setFilterMethod] = useState(null);
  const [selectedFilterStatus, setFilterStatus] = useState(null);
  const [selectedFilterServiceType, setFilterServiceType] = useState(null);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const columns = useMemo(
    () => [
      { Header: 'No. Nota Bayar', accessor: 'notaNumber', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value ?? '-'}</span> },
      { Header: 'No. Invoice Asal', accessor: 'invoiceNumber', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value ?? '-'}</span> },
      { Header: <FormattedMessage id="customer" />, accessor: 'customerName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: <FormattedMessage id="service-type" />,
        accessor: 'serviceType',
        Cell: (d) => <ServiceChip value={d.value} />
      },
      { Header: <FormattedMessage id="payment-method" />, accessor: 'paymentMethod' },
      {
        Header: 'Jumlah Bayar',
        accessor: 'amountPaid',
        Cell: (d) => formatCurrency(d.value)
      },
      {
        Header: 'Status Konfirmasi',
        accessor: 'isPayed',
        Cell: (d) =>
          d.value ? (
            <Chip color="success" label="Confirmed" size="small" variant="light" />
          ) : (
            <Chip color="warning" label="Pending" size="small" variant="light" />
          )
      },
      { Header: <FormattedMessage id="due-date" />, accessor: 'nextPayment', Cell: (d) => d.value ?? '-' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
    paramList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterMethod = (selected) => {
    paramList.paymentMethodId = selected?.value ?? '';
    setFilterMethod(selected);
    fetchData();
  };

  const onFilterStatus = (selected) => {
    paramList.isPayed = selected?.value ?? '';
    setFilterStatus(selected);
    fetchData();
  };

  const onFilterServiceType = (selected) => {
    paramList.serviceType = selected?.value ?? '';
    setFilterServiceType(selected);
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

  const fetchData = async () => {
    await getPaymentRecords(paramList)
      .then((resp) => {
        setRecordData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
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
      paymentMethodId: '',
      isPayed: '',
      serviceType: '',
      startDate: '',
      endDate: ''
    };
    setKeywordSearch('');
    setStartDate('');
    setEndDate('');
    setFilterLocation([]);
    setFilterMethod(null);
    setFilterStatus(null);
    setFilterServiceType(null);
  };

  const onExport = async () => {
    await exportPaymentRecords(paramList)
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
    const init = async () => {
      const [locations, methods] = await Promise.all([getLocationList(), getPaymentMethods().catch(() => ({ data: [] }))]);
      setFacilityLocationList(locations);
      setPaymentMethodList((methods.data || []).map((m) => ({ label: m.name, value: m.id })));
    };

    init();
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="payment-record" defaultMessage="Payment Record" />} isBreadcrumb={true} />
      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            {/* ── Filter Bar ── */}
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
                  id="filterServiceType"
                  options={serviceTypeOptions}
                  value={selectedFilterServiceType}
                  sx={{ width: 160 }}
                  isOptionEqualToValue={(option, val) => option.value === val.value}
                  onChange={(_, value) => onFilterServiceType(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="service-type" />} />}
                />
                <Autocomplete
                  id="filterMethod"
                  options={paymentMethodList}
                  value={selectedFilterMethod}
                  sx={{ width: 180 }}
                  isOptionEqualToValue={(option, val) => option.value === val.value}
                  onChange={(_, value) => onFilterMethod(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="payment-method" />} />}
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

            {/* ── Table ── */}
            <ReactTable
              columns={columns}
              data={recordData.data}
              totalPagination={recordData.totalPagination}
              setPageNumber={paramList.goToPage}
              setPageRow={paramList.rowPerPage}
              colSpanPagination={11}
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

export default FinancePaymentRecord;
