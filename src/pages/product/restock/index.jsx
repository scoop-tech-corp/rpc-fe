import { Button, Stack, useMediaQuery, Link, Autocomplete, TextField, Chip, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { deleteProductRestock, exportProductRestock, getProductRestock, productRestockSendSupplier } from './service';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { getSupplierList } from '../product-list/service';
import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SendIcon from '@mui/icons-material/Send';
import ProductRestockDetail from './detail';
import useAuth from 'hooks/useAuth';
import ProductRestockApproval from './approval';

let paramProductRestockList = {};

const ProductRestock = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [productRestockData, setProductRestockData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);

  const [supplierList, setSupplierList] = useState([]);
  const [selectedFilterSupplier, setFilterSupplier] = useState([]);

  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState({ isOpen: false, id: null });
  const [openApprove, setOpenApprove] = useState({ isOpen: false, id: null });
  const [dialogSend, setDialogSend] = useState({ isOpen: false, id: null });

  const allColumn = [
    {
      Header: <FormattedMessage id="id-number" />,
      accessor: 'numberId',
      Cell: (data) => {
        const getId = data.row.original.id;

        return <Link onClick={() => setOpenDetail({ isOpen: true, id: +getId })}>{data.value}</Link>;
      }
    },
    {
      Header: <FormattedMessage id="location" />,
      accessor: 'locationName'
    },
    {
      Header: <FormattedMessage id="supplier" />,
      accessor: 'supplierName'
    },
    {
      Header: <FormattedMessage id="product" />,
      accessor: 'products'
    },
    {
      Header: <FormattedMessage id="quantity" />,
      accessor: 'quantity'
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: (data) => {
        switch (+data.value) {
          case 0:
            return <Chip color="warning" label={<FormattedMessage id="draft" />} size="small" variant="light" />;
          case 1:
            return <Chip color="info" label={<FormattedMessage id="waiting-for-approval" />} size="small" variant="light" />;
          case 2:
            return <Chip color="error" label={<FormattedMessage id="reject" />} size="small" variant="light" />;
          case 3:
            return <Chip color="success" label={<FormattedMessage id="approved" />} size="small" variant="light" />;
          case 4:
            return <Chip color="default" label={<FormattedMessage id="send-to-supplier" />} size="small" variant="light" />;
          case 5:
            return <Chip label={<FormattedMessage id="product-received" />} size="small" variant="light" />;
        }
      }
    },
    { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
    { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
    {
      Header: <FormattedMessage id="action" />,
      accessor: 'action',
      style: { textAlign: 'center' },
      isNotSorting: true,
      Cell: (data) => {
        const getId = +data.row.original.id;
        const getStatus = +data.row.original.status;
        const getNumberId = data.row.original.numberId;

        const isDisabled = () => Boolean(getStatus !== 0 && getNumberId.toLowerCase() !== 'draft');

        return (
          <>
            <Stack spacing={1} flexDirection={'row'} alignItems={'center'} justifyContent={'center'}>
              <IconButton
                size="large"
                color="warning"
                onClick={() => navigate(`/product/restock/form/${getId}`, { replace: true })}
                disabled={isDisabled()}
              >
                <EditOutlined />
              </IconButton>
              {getStatus == 1 && ['administrator', 'office'].includes(user?.role) && (
                <IconButton size="large" color="primary" onClick={() => setOpenApprove({ isOpen: true, id: getId })}>
                  <ChecklistIcon />
                </IconButton>
              )}
              {getStatus == 3 && (
                <Tooltip title={<FormattedMessage id="approved" />} arrow>
                  <IconButton size="large" color="primary" onClick={() => setDialogSend({ isOpen: true, id: getId })}>
                    <SendIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </>
        );
      }
    }
  ];

  const selectedColumn =
    user?.role === 'administrator'
      ? [
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
            style: {
              width: '10px'
            }
          }
        ]
      : [];

  const columns = useMemo(
    () => [...selectedColumn, ...allColumn],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramProductRestockList.orderValue = event.order;
    paramProductRestockList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductRestockList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductRestockList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductRestockList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductRestockList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterSupplier = (selected) => {
    paramProductRestockList.supplierId = selected.map((dt) => dt.value);
    setFilterSupplier(selected);
    fetchData();
  };

  async function fetchData() {
    const resp = await getProductRestock(paramProductRestockList);
    setProductRestockData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramProductRestockList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [], supplierId: [] };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportProductRestock(paramProductRestockList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductRestock(selectedRow)
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

  const onConfirmSendSupplier = async (value) => {
    if (value) {
      await productRestockSendSupplier(dialogSend.id)
        .then((resp) => {
          if (resp.status === 200) {
            setDialogSend({ isOpen: false, id: null });
            dispatch(snackbarSuccess('Success send supplier'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            setDialogSend({ isOpen: false, id: null });
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDialogSend({ isOpen: false, id: null });
    }
  };

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
  };

  const getProductSupplier = async () => {
    const data = await getSupplierList();
    setSupplierList(data);
  };

  const getDataDropdown = () => {
    return new Promise(() => {
      getDataFacilityLocation();
      getProductSupplier();
    });
  };

  useEffect(() => {
    getDataDropdown();

    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="product-restock" />} isBreadcrumb={true} />
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
                <Autocomplete
                  id="filterSupplier"
                  multiple
                  limitTags={1}
                  options={supplierList}
                  value={selectedFilterSupplier}
                  sx={{ width: 280 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterSupplier(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-supplier" />} />}
                />
                {selectedRow.length > 0 && (
                  <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                    <FormattedMessage id="delete" />
                  </Button>
                )}
              </Stack>

              <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                  <RefreshIcon />
                </IconButton>
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlusOutlined />}
                  onClick={() => navigate('/product/restock/form', { replace: true })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={productRestockData.data}
              totalPagination={productRestockData.totalPagination}
              setPageNumber={paramProductRestockList.goToPage}
              setPageRow={paramProductRestockList.rowPerPage}
              colSpanPagination={10}
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
      {dialogSend.isOpen && (
        <ConfirmationC
          open={dialogSend.isOpen}
          title={<FormattedMessage id="confirmation" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-send-the-product-to-supplier" />}
          onClose={(response) => onConfirmSendSupplier(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {openDetail.isOpen && (
        <ProductRestockDetail
          id={openDetail.id}
          open={openDetail.isOpen}
          onClose={(event) => {
            setOpenDetail({ isOpen: false, id: null });
            if (event === 'trigerIndex') fetchData();
          }}
        />
      )}
      {openApprove.isOpen && (
        <ProductRestockApproval
          open={openApprove.isOpen}
          id={openApprove.id}
          onClose={(resp) => {
            setOpenApprove({ isOpen: false, id: null });
            if (resp) fetchData();
          }}
        />
      )}
    </>
  );
};

export default ProductRestock;
