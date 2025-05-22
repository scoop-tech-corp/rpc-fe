import { useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Button, Chip, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { FormattedMessage, useIntl } from 'react-intl';
import { createMessageBackend, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { exportProductRestock, getProductRestock, productRestockSendSupplier } from '../../service';

import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ChecklistIcon from '@mui/icons-material/Checklist';
import SendIcon from '@mui/icons-material/Send';
import ConfirmationC from 'components/ConfirmationC';
import ProductRestockApproval from '..';

let paramApprovalRestockList = {};
const ApprovalRestock = (props) => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [productRestockData, setProductRestockData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [openApprove, setOpenApprove] = useState({ isOpen: false, id: null });
  const [dialogSend, setDialogSend] = useState({ isOpen: false, id: null });

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="id-number" />,
        accessor: 'numberId'
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
              return <Chip color="primary" label={<FormattedMessage id="product-received" />} size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          const getId = +data.row.original.id;
          const getStatus = +data.row.original.status;
          // const getNumberId = data.row.original.numberId;

          return (
            <>
              {getStatus !== 4 && (
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
            </>
          );
        }
      }
    ],
    []
  );

  const [selectedFilterSupplier, setFilterSupplier] = useState([]);

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

  const onOrderingChange = (event) => {
    paramApprovalRestockList.orderValue = event.order;
    paramApprovalRestockList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramApprovalRestockList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramApprovalRestockList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramApprovalRestockList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramApprovalRestockList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterSupplier = (selected) => {
    paramApprovalRestockList.supplierId = selected.map((dt) => dt.value);
    setFilterSupplier(selected);
    fetchData();
  };

  async function fetchData() {
    const resp = await getProductRestock(paramApprovalRestockList);
    setProductRestockData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  }

  const clearParamFetchData = () => {
    paramApprovalRestockList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      supplierId: [],
      type: 'approval'
    };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportProductRestock(paramApprovalRestockList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
              options={props.filterLocationList}
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
              options={props.filterSupplierList}
              value={selectedFilterSupplier}
              sx={{ width: 280 }}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onFilterSupplier(value)}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-supplier" />} />}
            />
          </Stack>

          <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
            <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
              <RefreshIcon />
            </IconButton>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
              <FormattedMessage id="export" />
            </Button>
          </Stack>
        </Stack>
        <ReactTable
          columns={columns}
          data={productRestockData.data}
          totalPagination={productRestockData.totalPagination}
          setPageNumber={paramApprovalRestockList.goToPage}
          setPageRow={paramApprovalRestockList.rowPerPage}
          colSpanPagination={10}
          onOrder={onOrderingChange}
          onGotoPage={onGotoPageChange}
          onPageSize={onPageSizeChange}
        />
      </Stack>
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

ApprovalRestock.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any),
  filterSupplierList: PropTypes.arrayOf(PropTypes.any)
};

export default ApprovalRestock;
