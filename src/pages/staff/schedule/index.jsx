import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Button, Stack, useMediaQuery, Autocomplete, TextField, Link } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { GlobalFilter } from 'utils/react-table';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { DeleteFilled, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { deleteStaffSchedule, exportStaffSchedule, getStaffSchedule, getStaffScheduleDetail } from './service';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import DownloadIcon from '@mui/icons-material/Download';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import IconButton from 'components/@extended/IconButton';

import StaffScheduleForm from './form';
import StaffScheduleDetail from './detail';

let paramStaffScheduleList = {};

const StaffSchedule = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();

  const [staffScheduleData, setStaffScheduleData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);

  const [keywordSearch, setKeywordSearch] = useState('');
  const [dialog, setDialog] = useState(false);
  const [openForm, setOpenForm] = useState({ isOpen: false, data: null });
  const [openDetail, setOpenDetail] = useState({ isOpen: false, data: null });

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
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          return (
            <Link
              href="#"
              onClick={async () => {
                const getId = data.row.original.id;
                const getDataDetail = await onDataDetail('detail', getId);

                setOpenDetail({ isOpen: true, data: getDataDetail });
              }}
            >
              {data.value}
            </Link>
          );
        }
      },
      {
        Header: <FormattedMessage id="position" />,
        accessor: 'position'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      {
        Header: <FormattedMessage id="total-access-menu" />,
        accessor: 'totalAccessMenu'
      },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: (data) => {
          return (
            <IconButton
              size="large"
              color="warning"
              onClick={async () => {
                const getId = data.row.original.id;
                const getDataDetail = await onDataDetail('edit', getId);

                setOpenForm({ isOpen: true, data: getDataDetail });
              }}
            >
              <EditOutlined />
            </IconButton>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onOrderingChange = (event) => {
    paramStaffScheduleList.orderValue = event.order;
    paramStaffScheduleList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramStaffScheduleList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramStaffScheduleList.rowPerPage = event;
    fetchData();
  };

  const onSearch = (event) => {
    paramStaffScheduleList.keyword = event;
    setKeywordSearch(event);

    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramStaffScheduleList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const fetchData = async () => {
    const resp = await getStaffSchedule(paramStaffScheduleList);
    setStaffScheduleData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramStaffScheduleList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [] };
    setKeywordSearch('');
  };

  const onExport = async () => {
    await exportStaffSchedule(paramStaffScheduleList)
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onDataDetail = (type, id) => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getRespDetail = await getStaffScheduleDetail({ id, type });
      resolve(getRespDetail.data);
    });
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteStaffSchedule(selectedRow)
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

  const initPage = () => {
    getDataFacilityLocation();

    clearParamFetchData();
    fetchData();
  };

  useEffect(() => {
    initPage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="schedule" />} isBreadcrumb={true} />
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
                <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                  <FormattedMessage id="export" />
                </Button>
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm({ isOpen: true, data: null })}>
                  <FormattedMessage id="new" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={staffScheduleData.data}
              totalPagination={staffScheduleData.totalPagination}
              setPageNumber={paramStaffScheduleList.goToPage}
              setPageRow={paramStaffScheduleList.rowPerPage}
              colSpanPagination={8}
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
      {openForm.isOpen && (
        <StaffScheduleForm
          open={openForm.isOpen}
          data={openForm.data}
          onClose={(event) => {
            setOpenForm({ isOpen: false, data: null });
            if (event) initPage();
          }}
        />
      )}
      <StaffScheduleDetail
        open={openDetail.isOpen}
        data={openDetail.data}
        onClose={(event) => {
          setOpenDetail({ isOpen: false, data: null });
          if (event) initPage();
        }}
        onRefreshIndex={(event) => {
          setOpenDetail({ isOpen: false, data: null });
          if (event) initPage();
        }}
      />
    </>
  );
};

export default StaffSchedule;
