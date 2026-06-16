import { Button, Stack, useMediaQuery, Autocomplete, TextField, Chip } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getPiutang, getAgingSummary, exportPiutang } from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';
import AgingSummaryCards from './components/AgingSummaryCards';

let paramList = {};

const serviceTypeOptions = [
  { label: 'Pet Clinic', value: 'Pet Clinic' },
  { label: 'Pet Hotel', value: 'Pet Hotel' },
  { label: 'Pet Salon', value: 'Pet Salon' },
  { label: 'Breeding', value: 'Breeding' },
  { label: 'Pet Shop', value: 'Pet Shop' }
];

const formatCurrency = (val) => {
  if (val === null || val === undefined || val === '') return '-';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const AGING_COLOR = {
  current: 'success',
  '1-30': 'warning',
  '31-60': 'warning',
  '61-90': 'error',
  '>90': 'error'
};

const AGING_LABEL = {
  current: 'Belum Jatuh Tempo',
  '1-30': '1-30 Hari',
  '31-60': '31-60 Hari',
  '61-90': '61-90 Hari',
  '>90': '> 90 Hari'
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

const FinancePiutang = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [piutangData, setPiutangData] = useState({ data: [], totalPagination: 0 });
  const [agingData, setAgingData] = useState(null);
  const [agingLoading, setAgingLoading] = useState(true);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterServiceType, setFilterServiceType] = useState(null);
  const [selectedAgingBucket, setSelectedAgingBucket] = useState('');
  const [keywordSearch, setKeywordSearch] = useState('');

  const columns = useMemo(
    () => [
      { Header: 'No. Invoice', accessor: 'invoiceNumber', Cell: (d) => <span style={{ fontSize: 11 }}>{d.value ?? '-'}</span> },
      { Header: <FormattedMessage id="customer" />, accessor: 'customerName' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: <FormattedMessage id="service-type" />,
        accessor: 'serviceType',
        Cell: (d) => <ServiceChip value={d.value} />
      },
      { Header: 'Tgl Transaksi', accessor: 'transactionDate' },
      { Header: 'Jatuh Tempo', accessor: 'dueDate', Cell: (d) => d.value ?? '-' },
      { Header: 'Total Tagihan', accessor: 'total', Cell: (d) => formatCurrency(d.value) },
      {
        Header: 'Sisa Tagihan',
        accessor: 'remaining',
        Cell: (d) => <span style={{ color: '#c62828', fontWeight: 600 }}>{formatCurrency(d.value)}</span>
      },
      {
        Header: 'Aging',
        accessor: 'agingBucket',
        Cell: (d) => (
          <Chip color={AGING_COLOR[d.value] ?? 'default'} label={AGING_LABEL[d.value] ?? d.value ?? '-'} size="small" variant="light" />
        )
      },
      {
        Header: 'Hari Lewat',
        accessor: 'daysOverdue',
        Cell: (d) => {
          const days = Number(d.value);
          if (days === 0) return <span style={{ color: '#2e7d32' }}>-</span>;
          return <span style={{ color: days > 60 ? '#c62828' : '#e65100', fontWeight: 600 }}>{days} hari</span>;
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' }
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

  const onFilterServiceType = (selected) => {
    paramList.serviceType = selected?.value ?? '';
    setFilterServiceType(selected);
    fetchData();
  };

  const onBucketClick = (bucket) => {
    paramList.agingBucket = bucket;
    setSelectedAgingBucket(bucket);
    fetchData();
  };

  const fetchAgingSummary = async () => {
    setAgingLoading(true);
    await getAgingSummary(paramList)
      .then((resp) => setAgingData(resp.data))
      .catch(() => {})
      .finally(() => setAgingLoading(false));
  };

  const fetchData = async () => {
    fetchAgingSummary();
    await getPiutang(paramList)
      .then((resp) => {
        setPiutangData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
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
      serviceType: '',
      agingBucket: ''
    };
    setKeywordSearch('');
    setFilterLocation([]);
    setFilterServiceType(null);
    setSelectedAgingBucket('');
  };

  const onExport = async () => {
    await exportPiutang(paramList)
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

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="piutang" defaultMessage="Piutang / Aging Report" />} isBreadcrumb={true} />

      {/* ── Aging Summary Cards ── */}
      <MainCard content={false} sx={{ mb: 2 }}>
        <AgingSummaryCards data={agingData} loading={agingLoading} activeFilter={selectedAgingBucket} onBucketClick={onBucketClick} />
        <Stack sx={{ px: 3, pb: 2, pt: 1 }}>
          <span style={{ fontSize: 11, color: '#9e9e9e' }}>
            💡 Klik kartu untuk filter tabel berdasarkan aging. Klik lagi untuk hapus filter.
          </span>
        </Stack>
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
              data={piutangData.data}
              totalPagination={piutangData.totalPagination}
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

export default FinancePiutang;
