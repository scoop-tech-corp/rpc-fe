import {
  Button,
  Stack,
  useMediaQuery,
  Link,
  Autocomplete,
  TextField,
  Chip,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Tooltip
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { FormattedMessage, useIntl } from 'react-intl';
import { DeleteFilled, EditOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { deleteProductTransfer, exportProductTransfer, getProductTransfer } from './service';
// import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import ConfirmationC from 'components/ConfirmationC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChecklistIcon from '@mui/icons-material/Checklist';

let paramProductTransferList = {};

const ProductTransfer = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const intl = useIntl();

  const [productTransferData, setProductTransferData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [selectedFilterStatus, setFilterStatus] = useState('');
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
        style: {
          width: '10px'
        }
      },
      {
        Header: <FormattedMessage id="id-number" />,
        accessor: 'numberId',
        Cell: (data) => {
          // const getId = data.row.original.id;

          return <Link>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="transfer-number" />,
        accessor: 'transferNumber'
      },
      {
        Header: <FormattedMessage id="transfer-name" />,
        accessor: 'transferName'
      },
      {
        Header: 'Variant Product',
        accessor: 'variantProduct'
      },
      {
        Header: <FormattedMessage id="total-product" />,
        accessor: 'totalProduct'
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
      {
        Header: <FormattedMessage id="branch-origin" />,
        accessor: 'locationOriginName'
      },
      {
        Header: <FormattedMessage id="branch-destination" />,
        accessor: 'locationDestinationName'
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: () => {
          //data
          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              <Tooltip title={<FormattedMessage id="edit" />} arrow>
                <IconButton size="large" color="warning">
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Recall'} arrow>
                <IconButton size="large" color="success">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={<FormattedMessage id="approved" />} arrow>
                <IconButton size="large" color="primary">
                  <CheckCircleOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title={<FormattedMessage id="reject" />} arrow>
                <IconButton size="large" color="error">
                  <CloseCircleOutlined />
                </IconButton>
              </Tooltip>
              <IconButton size="large" color="primary" onClick={() => setOpenApprove({ isOpen: true, id: getId })}>
                <ChecklistIcon />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramProductTransferList.orderValue = event.order;
    paramProductTransferList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramProductTransferList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramProductTransferList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramProductTransferList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramProductTransferList.locationDestinationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterStatus = (event) => {
    paramProductTransferList.status = event.target.value;
    setFilterStatus(event.target.value);
    fetchData();
  };

  const fetchData = async () => {
    const resp = await getProductTransfer(paramProductTransferList);
    console.log('resp fetchData', resp.data.data);
    setProductTransferData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramProductTransferList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationDestinationId: [],
      status: ''
    };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportProductTransfer(paramProductTransferList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteProductTransfer(selectedRow)
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

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
  };

  useEffect(() => {
    getDataFacilityLocation();

    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="product-transfer" />} isBreadcrumb={true} />
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
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="branch-destination" />} />}
                />
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel htmlFor="status">Status</InputLabel>
                  <Select id="status" name="status" value={selectedFilterStatus} onChange={onFilterStatus} placeholder="Select status">
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select-status" />
                      </em>
                    </MenuItem>
                    <MenuItem value={0}>{<FormattedMessage id="draft" />}</MenuItem>
                    <MenuItem value={1}>{<FormattedMessage id="waiting-for-approval" />}</MenuItem>
                    <MenuItem value={2}>{<FormattedMessage id="reject" />}</MenuItem>
                    <MenuItem value={3}>{<FormattedMessage id="approved" />}</MenuItem>
                    <MenuItem value={4}>{<FormattedMessage id="send-to-receiver" />}</MenuItem>
                    <MenuItem value={5}>{<FormattedMessage id="product-received" />}</MenuItem>
                  </Select>
                </FormControl>
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
                  //onClick={() => navigate('/product/restock/form', { replace: true })}
                >
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={productTransferData.data}
              totalPagination={productTransferData.totalPagination}
              setPageNumber={paramProductTransferList.goToPage}
              setPageRow={paramProductTransferList.rowPerPage}
              colSpanPagination={12}
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

export default ProductTransfer;
