import { Button, Stack, useMediaQuery, Link, Autocomplete, TextField, Chip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { deleteStockOpname, exportStockOpname, getStockOpname, printStockOpname } from './service';
import { processDownloadPDF } from 'service/service-global';
import { useNavigate } from 'react-router';

import StockOpnameDetail from './detail';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';

let paramStockOpnameList = {};

const STATUS_MAP = {
  1: { label: 'Draft', color: 'warning' },
  2: { label: 'On Progress', color: 'info' },
  3: { label: 'Pending Approval Checker', color: 'secondary' },
  4: { label: 'Pending Approval Director', color: 'secondary' },
  5: { label: 'Done', color: 'success' },
  6: { label: 'Rejected', color: 'error' }
};

const StockOpname = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stockOpnameData, setStockOpnameData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: null });

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.id);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true,
        style: { width: '10px' }
      },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const row = data.row.original;
          if (+row.statusId !== 5) return null;
          return (
            <IconButton size="small" color="primary" title="Print" onClick={() => onPrint(row.id)}>
              <PrintOutlinedIcon fontSize="small" />
            </IconButton>
          );
        }
      },
      {
        Header: <FormattedMessage id="id-number" />,
        accessor: 'stockOpnameNumber',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link onClick={() => setOpenDetail({ isOpen: true, id: getId })}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="title" />, accessor: 'title' },
      { Header: <FormattedMessage id="start-time" />, accessor: 'startTime' },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      {
        Header: 'Status',
        accessor: 'statusId',
        Cell: (data) => {
          const status = STATUS_MAP[+data.value] ?? { label: data.row.original.statusName ?? '-', color: 'default' };
          return <Chip color={status.color} label={status.label} size="small" variant="light" />;
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramStockOpnameList.orderValue = event.order;
    paramStockOpnameList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramStockOpnameList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramStockOpnameList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramStockOpnameList.keyword = event;
    setKeywordSearch(event);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramStockOpnameList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const fetchData = async () => {
    await getStockOpname(paramStockOpnameList)
      .then((resp) => {
        setStockOpnameData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearParamFetchData = () => {
    paramStockOpnameList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [], status: '' };
    setKeywordSearch('');
  };

  const onPrint = async (id) => {
    await printStockOpname(id)
      .then((resp) => processDownloadPDF(resp, 'stock_opname'))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onExport = async () => {
    await exportStockOpname(paramStockOpnameList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteStockOpname(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success delete data'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            setDialog(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialog(false);
    }
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
      <HeaderPageCustom title={<FormattedMessage id="stock-opname" />} isBreadcrumb={true} />
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
              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
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
                  sx={{ width: 280 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={fetchData}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={() => navigate('/product/stockopname/form', { replace: true })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={stockOpnameData.data}
              totalPagination={stockOpnameData.totalPagination}
              setPageNumber={paramStockOpnameList.goToPage}
              setPageRow={paramStockOpnameList.rowPerPage}
              colSpanPagination={9}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </Stack>
        </ScrollX>
      </MainCard>
      {dialog && (
        <ConfirmationC
          open={dialog}
          title={<FormattedMessage id="delete" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
          onClose={(response) => onConfirm(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
      {openDetail.isOpen && (
        <StockOpnameDetail
          open={openDetail.isOpen}
          id={openDetail.id}
          onClose={() => setOpenDetail({ isOpen: false, id: null })}
          onSuccess={() => { setOpenDetail({ isOpen: false, id: null }); fetchData(); }}
        />
      )}
    </>
  );
};

export default StockOpname;
