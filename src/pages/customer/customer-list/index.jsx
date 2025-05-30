/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import {
  createMessageBackend,
  detectUserPrivilage,
  getCustomerGroupList,
  getLocationList,
  processDownloadExcel
} from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { GlobalFilter } from 'utils/react-table';
import { getCustomerList, deleteCustomerList, exportCustomer } from '../service';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import DownloadIcon from '@mui/icons-material/Download';
import iconWhatsapp from '../../../../src/assets/images/ico-whatsapp.png';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import useAuth from 'hooks/useAuth';

let paramCustomerList = {};

const CustomerList = () => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const intl = useIntl();
  const roleCanExport = ['administrator', 'office'];
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getCustomerListData, setCustomerListData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);
  const [dialog, setDialog] = useState(false);
  const { user } = useAuth();
  const userPrivilage = detectUserPrivilage(user?.extractMenu.masterMenu);

  const isCheckbox = () => {
    return userPrivilage == 4
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
            style: { width: '10px' }
          }
        ]
      : [];
  };

  const columns = useMemo(
    () => [
      ...isCheckbox(),
      {
        Header: <FormattedMessage id="customer-name" />,
        accessor: 'customerName',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/customer/list/form/${getId}`}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="customer-group" />,
        accessor: 'customerGroup'
      },
      {
        Header: <FormattedMessage id="no-member" />,
        accessor: 'memberNo'
      },
      {
        Header: <FormattedMessage id="total-pet" />,
        accessor: 'totalPet'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="phone-number" />,
        accessor: 'phoneNumber',
        Cell: (data) => {
          const isWhatsapp = +data.row.original.isWhatsapp;
          const onClickWhatsapp = () => window.open(`https://api.whatsapp.com/send?phone=${data.value}&text=%20`, '_blank'); //

          return (
            <>
              <span>{data.value}</span>&nbsp;&nbsp;
              {isWhatsapp === 1 && <img src={iconWhatsapp} onClick={() => onClickWhatsapp()} width="15" height="15" alt="icon-whatsapp" />}
            </>
          );
        }
      },
      {
        Header: 'Email',
        accessor: 'emailAddress'
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy'
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramCustomerList.orderValue = event.order;
    paramCustomerList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramCustomerList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramCustomerList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramCustomerList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onSearch = (event) => {
    paramCustomerList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onClickAdd = () => {
    navigate('/customer/list/form', { replace: true });
  };

  const onExport = async () => {
    await exportCustomer(paramCustomerList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const fetchData = async () => {
    await getCustomerList(paramCustomerList)
      .then((resp) => {
        setCustomerListData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const clearParamFetchData = () => {
    paramCustomerList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [], customerGroupId: [] };
  };

  const getDropdownData = async () => {
    loaderService.setManualLoader(true);
    loaderGlobalConfig.setLoader(true);

    const data = await getLocationList();
    const getCustomerGroup = await getCustomerGroupList();

    setFacilityLocationList(data);
    setFilterCustomerGroupList(getCustomerGroup);

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteCustomerList(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Customer'));
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

  const onRefresh = () => fetchData();

  useEffect(() => {
    getDropdownData();
    clearParamFetchData();
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="customer-list" />} isBreadcrumb={true} />
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
                options={facilityLocationList}
                value={selectedFilterLocation}
                sx={{ width: 350 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, value) => onFilterLocation(value)}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
              />
              <Autocomplete
                id="filter-customer-group"
                multiple
                limitTags={1}
                options={filterCustomerGroupList}
                value={selectedFilterCustomerGroup}
                sx={{ width: 350 }}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => {
                  paramCustomerList.customerGroupId = selected.map((dt) => dt.value);
                  setFilterCustomerGroup(selected);
                  fetchData();
                }}
                renderInput={(params) => <TextField {...params} label={<FormattedMessage id="customer-group" />} />}
              />
              {selectedRow.length > 0 && (
                <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                  <FormattedMessage id="delete" />
                </Button>
              )}
            </Stack>
            <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
              <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
              {roleCanExport.includes(user?.role) && (
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
              )}
              {[2, 4].includes(userPrivilage) && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="new" />
                </Button>
              )}
            </Stack>
          </Stack>
          <ScrollX>
            <ReactTable
              columns={columns}
              data={getCustomerListData.data}
              totalPagination={getCustomerListData.totalPagination}
              setPageNumber={paramCustomerList.goToPage}
              setPageRow={paramCustomerList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
              colSpanPagination={10}
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

export default CustomerList;
