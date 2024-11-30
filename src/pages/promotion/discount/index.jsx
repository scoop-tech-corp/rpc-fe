import { useMediaQuery, Stack, Autocomplete, TextField, Button, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import {
  deletePromotionDiscountList,
  exportPromotionDiscount,
  getPromoDiscountType,
  getPromotionDiscountDetail,
  getPromotionDiscountList
} from './service';
import { useMemo, useState, useEffect } from 'react';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { GlobalFilter } from 'utils/react-table';
import { FormattedMessage, useIntl } from 'react-intl';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';

import IconButton from 'components/@extended/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import useAuth from 'hooks/useAuth';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

let paramPromoDiscountList = {};
const PromotionDiscount = () => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const { user } = useAuth();

  const [openDetail, setOpenDetail] = useState({ isOpen: false, data: null });
  const [promoDiscountData, setPromoDiscountData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [ddLocationList, setDdLocationList] = useState([]);
  const [selectedFilterType, setFilterType] = useState([]);
  const [ddTypeList, setDdTypeList] = useState([]);
  const [dialog, setDialog] = useState(false);

  const columns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => +original.id);
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
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const onDetail = async () => {
            const getResp = await getPromotionDiscountDetail(+data.row.original.id);
            setOpenDetail({ isOpen: true, data: getResp.data });
          };

          return (
            <Link href="#" onClick={onDetail}>
              {data.value}
            </Link>
          );
        }
      },
      { Header: <FormattedMessage id="type" />, accessor: 'type' },
      { Header: <FormattedMessage id="start-date" />, accessor: 'startDate' },
      { Header: <FormattedMessage id="end-date" />, accessor: 'endDate' },
      { Header: 'Status', accessor: 'status' },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' }
    ],
    []
  );

  const onExport = async () => {
    await exportPromotionDiscount(paramPromoDiscountList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onSearch = (event) => {
    paramPromoDiscountList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onOrderingChange = (event) => {
    paramPromoDiscountList.orderValue = event.order;
    paramPromoDiscountList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramPromoDiscountList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramPromoDiscountList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramPromoDiscountList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onFilterType = (selected) => {
    paramPromoDiscountList.type = selected.map((dt) => dt.value);
    setFilterType(selected);
    fetchData();
  };

  const onConfirm = async (value) => {
    if (value) {
      await deletePromotionDiscountList(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Promo'));
            clearParamFetchData();
            fetchData();
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  const clearParamFetchData = () => {
    paramPromoDiscountList = {
      rowPerPage: 5,
      goToPage: 1,
      orderValue: '',
      orderColumn: '',
      keyword: '',
      locationId: [],
      type: []
    };
  };

  const fetchData = async () => {
    await getPromotionDiscountList(paramPromoDiscountList)
      .then((resp) => {
        setPromoDiscountData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const getDataDropdown = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLoc = await getLocationList();
      const getType = await getPromoDiscountType();

      setDdLocationList(getLoc);
      setDdTypeList(getType);
      resolve(true);
    });
  };

  const getInitData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);
    clearParamFetchData();

    await getDataDropdown();
    await fetchData();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getInitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title="Promo List" isBreadcrumb={true} />
      <MainCard content={false}>
        <Stack spacing={3}>
          <Stack
            direction={matchDownMD ? 'column' : 'row'}
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            sx={{ p: 3, pb: 0 }}
          >
            <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
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
                options={ddLocationList}
                value={selectedFilterLocation}
                sx={{ width: 225 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterLocation(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
              />
              <Autocomplete
                id="fitlerType"
                multiple
                limitTags={1}
                options={ddTypeList}
                value={selectedFilterType}
                sx={{ width: 225 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterType(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-type" />} />}
              />
              {selectedRow.length > 0 && (
                <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                  <FormattedMessage id="delete" />
                </Button>
              )}
            </Stack>
            <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
              <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={() => fetchData()}>
                <RefreshIcon />
              </IconButton>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                onClick={() => navigate('/promotion/discount/form', { replace: true })}
              >
                <FormattedMessage id="new" />
              </Button>
            </Stack>
          </Stack>

          <ScrollX>
            <ReactTable
              columns={columns}
              data={promoDiscountData.data}
              totalPagination={promoDiscountData.totalPagination}
              setPageNumber={paramPromoDiscountList.goToPage}
              setPageRow={paramPromoDiscountList.rowPerPage}
              colSpanPagination={9}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
            />
          </ScrollX>
        </Stack>
      </MainCard>
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

export default PromotionDiscount;
