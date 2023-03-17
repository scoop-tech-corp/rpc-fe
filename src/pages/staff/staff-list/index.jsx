/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Chip, Stack, useMediaQuery, Button, Link, Autocomplete, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { deleteStaffList, exportStaff, getStaffList } from './service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import DownloadIcon from '@mui/icons-material/Download';
import iconWhatsapp from '../../../../src/assets/images/ico-whatsapp.png';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

let paramStaffList = {};

const StaffList = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getStaffListData, setStaffListData] = useState({ data: [], totalPagination: 0 });
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
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
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const getId = data.row.original.id;
          return <Link href={`/staff/list/form/${getId}`}>{data.value}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="position" />,
        accessor: 'jobTitle'
      },
      {
        Header: <FormattedMessage id="email-address" />,
        accessor: 'emailAddress'
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
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          switch (data.value.toLowerCase()) {
            case 'active':
              return <Chip color="success" label="Active" size="small" variant="light" />;
            default:
              return <Chip color="error" label="Non Active" size="small" variant="light" />;
          }
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
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
    paramStaffList.orderValue = event.order;
    paramStaffList.orderColumn = event.column;
    fetchData();
  };

  const onGotoPageChange = (event) => {
    paramStaffList.goToPage = event;
    fetchData();
  };

  const onPageSizeChange = (event) => {
    paramStaffList.rowPerPage = event;
    fetchData();
  };

  const onFilterLocation = (selected) => {
    paramStaffList.locationId = selected.map((dt) => dt.value);
    setFilterLocation(selected);
    fetchData();
  };

  const onClickAdd = () => {
    navigate('/staff/list/form', { replace: true });
  };

  const onExport = async () => {
    await exportStaff(paramStaffList)
      .then((resp) => {
        let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
        let downloadUrl = URL.createObjectURL(blob);
        let a = document.createElement('a');
        const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

        a.href = downloadUrl;
        a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
        document.body.appendChild(a);
        a.click();
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const fetchData = async () => {
    const getData = await getStaffList(paramStaffList);
    setStaffListData({ data: getData.data.data, totalPagination: getData.data.totalPagination });
  };

  const clearParamFetchData = () => {
    paramStaffList = { rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', locationId: [] };
  };

  const getDataFacilityLocation = async () => {
    const data = await getLocationList();
    setFacilityLocationList(data);
  };

  const onConfirm = async (value) => {
    if (value) {
      await deleteStaffList(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete staff'));
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

  useEffect(() => {
    getDataFacilityLocation();
    clearParamFetchData();
    fetchData();
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="staff-list" />} isBreadcrumb={true} />
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
                <Autocomplete
                  id="filterLocation"
                  multiple
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
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
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={onClickAdd}>
                  <FormattedMessage id="staff" />
                </Button>
              </Stack>
            </Stack>
            <ReactTable
              columns={columns}
              data={getStaffListData.data}
              totalPagination={getStaffListData.totalPagination}
              setPageNumber={paramStaffList.goToPage}
              setPageRow={paramStaffList.rowPerPage}
              onOrder={onOrderingChange}
              onGotoPage={onGotoPageChange}
              onPageSize={onPageSizeChange}
              colSpanPagination={9}
            />
          </Stack>
        </ScrollX>
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

export default StaffList;
