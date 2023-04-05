import {
  Autocomplete,
  Button,
  Chip,
  Stack,
  TextField,
  Tooltip,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { ReactTable } from 'components/third-party/ReactTable';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { FormattedMessage, useIntl } from 'react-intl';
import { getDetailTransferProduct, getTransferProduct, updateTransferProductApproval } from './service';
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';
import useAuth from 'hooks/useAuth';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DetailTransferProduct from './detail';
import ReceiverConfirmation from './receiver-confirmation';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';

let paramTransferProductList = {};

const TransferProduct = (props) => {
  const [transferProductData, setTransferProductData] = useState({ data: [], totalPagination: 0 });
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [isOpenDetail, setIsOpenDetail] = useState({ isOpen: false, data: null });
  const [isOpenAcceptProduct, setIsOpenAcceptProduct] = useState({ isOpen: false, id: null });
  const [dialogConfirmation, setDialogConfirmation] = useState({ isApproval: false, isReject: false, data: { id: null, status: null } });
  const [locationType, setLocationType] = useState('');

  const { user } = useAuth();
  const dispatch = useDispatch();
  const intl = useIntl();
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columnReceivedBy =
    user.role === 'administrator' || user.role === 'office'
      ? [{ Header: <FormattedMessage id="received-by" />, accessor: 'receivedBy' }]
      : [];
  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="no-transfer" />, accessor: 'transferNumber' },
      { Header: <FormattedMessage id="transfer-name" />, accessor: 'transferName' },
      { Header: <FormattedMessage id="from" />, accessor: 'from' },
      { Header: <FormattedMessage id="to" />, accessor: 'to' },
      { Header: <FormattedMessage id="product-type" />, accessor: 'productType' },
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName' },
      { Header: <FormattedMessage id="total-item" />, accessor: 'totalItem' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (+data.value) {
            case 0:
              return <Chip color="warning" label={<FormattedMessage id="waiting-for-approval" />} size="small" variant="light" />;
            case 1:
              return <Chip color="success" label={<FormattedMessage id="approved" />} size="small" variant="light" />;
            case 2:
              return <Chip color="error" label={<FormattedMessage id="reject" />} size="small" variant="light" />;
          }
        }
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      ...columnReceivedBy,
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: { textAlign: 'center' },
        Cell: (data) => {
          const getId = data.row.original.id;
          const status = data.row.original.status;

          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              {user.role === 'administrator' || user.role === 'office' ? (
                <>
                  {status && +status === 0 && (
                    <>
                      <Tooltip title={<FormattedMessage id="approved" />} arrow>
                        <IconButton size="large" color="primary" onClick={() => onClickApproval(data.row.original)}>
                          <CheckCircleOutlined />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={<FormattedMessage id="reject" />} arrow>
                        <IconButton size="large" color="error" onClick={() => onClickReject(data.row.original)}>
                          <CloseCircleOutlined />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title={<FormattedMessage id="details" />} arrow>
                    <IconButton size="large" color="info" onClick={() => onClickDetail(getId)}>
                      <EyeOutlined />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <Button variant="contained" color="primary" onClick={() => setIsOpenAcceptProduct({ isOpen: true, id: getId })}>
                  <FormattedMessage id="accept" />
                </Button>
              )}
            </Stack>
          );
        }
      }
    ],
    [columnReceivedBy, user.role]
  );

  const onLocationType = (event) => {
    setLocationType(event.target.value);
    paramTransferProductList.locationType = event.target.value;
    fetchData();
  };

  const onClickDetail = async (id) => {
    const resp = await getDetailTransferProduct(id);
    setIsOpenDetail({ isOpen: true, data: resp.data });
  };

  const onClickApproval = async (rowData) =>
    setDialogConfirmation((prev) => ({ ...prev, isApproval: true, isReject: false, data: { id: +rowData.id, status: 1 } }));

  const onConfirmApproval = async (data) => {
    if (data) {
      const param = { id: dialogConfirmation.data.id, status: dialogConfirmation.data.status, reason: '' };
      await updateTransferProductApproval(param)
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(snackbarSuccess(<FormattedMessage id="success-received-approval" />));
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    }
    setDialogConfirmation((prev) => ({ ...prev, isApproval: false }));
  };
  const onClickReject = (rowData) =>
    setDialogConfirmation((prev) => ({ ...prev, isApproval: false, isReject: true, data: { id: +rowData.id, status: 2 } }));

  const onSubmitReject = async (reason) => {
    const param = { id: dialogConfirmation.data.id, status: dialogConfirmation.data.status, reason };
    await updateTransferProductApproval(param)
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess(<FormattedMessage id="rejection-has-been-successful" />));
          fetchData();
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
    setDialogConfirmation((prev) => ({ ...prev, isReject: false }));
  };

  const onCloseReceiver = (e) => {
    setIsOpenAcceptProduct(false);
    if (e) {
      fetchData();
    }
  };

  const onOrderingChange = (event) => {
    paramTransferProductList.orderValue = event.order;
    paramTransferProductList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramTransferProductList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramTransferProductList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramTransferProductList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramTransferProductList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const clearParamFetchData = () => {
    paramTransferProductList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      locationType: '',
      type: 'product'
    };
    setKeywordSearch('');
  };

  async function fetchData() {
    await getTransferProduct(paramTransferProductList)
      .then((resp) => {
        setTransferProductData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  }

  useEffect(() => {
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollX>
        <Stack spacing={3}>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ pt: 1 }}>
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              <GlobalFilter
                placeHolder={intl.formatMessage({ id: 'search' })}
                globalFilter={keywordSearch}
                setGlobalFilter={onSearch}
                style={{ height: '41.3px' }}
              />
              {(user.role === 'administrator' || user.role === 'office') && (
                <>
                  <FormControl sx={{ m: 1, minWidth: 200 }} style={{ height: '41.3px' }}>
                    <InputLabel>{<FormattedMessage id="select-location-type" />}</InputLabel>
                    <Select id="location-type" name="location-type" value={locationType} onChange={onLocationType}>
                      <MenuItem value="">
                        <em>{<FormattedMessage id="select-location-type" />}</em>
                      </MenuItem>
                      <MenuItem value={'from'}>
                        <FormattedMessage id="from" />
                      </MenuItem>
                      <MenuItem value={'to'}>
                        <FormattedMessage id="to" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Autocomplete
                    id="filterLocation"
                    multiple
                    limitTags={1}
                    options={props.filterLocationList || []}
                    value={selectedFilterLocation}
                    sx={{ width: 300 }}
                    style={{ height: '41.3px' }}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, value) => onFilterLocation(value)}
                    renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                  />
                </>
              )}
            </Stack>
            <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
              <RefreshIcon />
            </IconButton>
          </Stack>
          <ReactTable
            columns={columns}
            data={transferProductData.data}
            totalPagination={transferProductData.totalPagination}
            setPageNumber={paramTransferProductList.goToPage}
            colSpanPagination={12}
            onOrder={onOrderingChange}
            onGotoPage={onGotoPageChange}
            onPageSize={onPageSizeChange}
          />
        </Stack>
      </ScrollX>

      <FormReject
        open={dialogConfirmation.isReject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-rejecting-transfer-product" />}
        onSubmit={(param) => onSubmitReject(param)}
        onClose={() => setDialogConfirmation((prevState) => ({ ...prevState, isReject: false }))}
      />

      <ConfirmationC
        open={dialogConfirmation.isApproval}
        title={<FormattedMessage id="confirmation" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-approve-this-request" />}
        onClose={(response) => onConfirmApproval(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

      {isOpenDetail.isOpen && (
        <DetailTransferProduct
          open={isOpenDetail.isOpen}
          data={isOpenDetail.data}
          onClose={(e) => setIsOpenDetail({ isOpen: !e, data: null })}
        />
      )}
      <ReceiverConfirmation open={isOpenAcceptProduct.isOpen} id={isOpenAcceptProduct.id} onClose={onCloseReceiver} />
    </>
  );
};

TransferProduct.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default TransferProduct;
