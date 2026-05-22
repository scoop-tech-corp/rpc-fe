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
import { deleteProductLoan, exportProductLoan, getProductLoan } from './service';
import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';

let paramProductLoanList = {};

const ProductLoan = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [productLoanData, setProductLoanData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);

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
        Header: <FormattedMessage id="id-number" />,
        accessor: 'numberId',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link onClick={() => navigate(`/product/loan/detail/${getId}`)}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="location" />, accessor: 'locationName' },
      { Header: <FormattedMessage id="product" />, accessor: 'product' },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity' },
      { Header: <FormattedMessage id="borrower" />, accessor: 'borrower' },
      { Header: <FormattedMessage id="loan-date" />, accessor: 'loanDate' },
      { Header: <FormattedMessage id="return-date" />, accessor: 'returnDate' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label={<FormattedMessage id="draft" />} size="small" variant="light" />;
            case 1:
              return <Chip color="info" label={<FormattedMessage id="on-loan" />} size="small" variant="light" />;
            case 2:
              return <Chip color="success" label={<FormattedMessage id="returned" />} size="small" variant="light" />;
            case 3:
              return <Chip color="error" label={<FormattedMessage id="overdue" />} size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramProductLoanList.orderValue = event.order;
    paramProductLoanList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductLoanList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductLoanList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductLoanList.keyword = event;
    setKeywordSearch(event);
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductLoanList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const fetchData = async () => {
    await getProductLoan(paramProductLoanList)
      .then((resp) => {
        setProductLoanData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearParamFetchData = () => {
    paramProductLoanList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [], status: '' };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportProductLoan(paramProductLoanList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductLoan(selectedRow)
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
      <HeaderPageCustom title={<FormattedMessage id="loan" />} isBreadcrumb={true} />
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
                  onClick={() => navigate('/product/loan/form', { replace: true })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={productLoanData.data}
              totalPagination={productLoanData.totalPagination}
              setPageNumber={paramProductLoanList.goToPage}
              setPageRow={paramProductLoanList.rowPerPage}
              colSpanPagination={11}
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
    </>
  );
};

export default ProductLoan;
