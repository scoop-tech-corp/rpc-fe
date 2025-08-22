import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { GlobalFilter } from 'utils/react-table';
import { Autocomplete, Button, IconButton, Link, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import {
  approvalFullShift,
  approvalLongShift,
  deleteFullShift,
  deleteLongShift,
  exportFullShift,
  exportLongShift,
  getFullShiftData,
  getLongShiftData
} from '../service';
import { createMessageBackend, getLocationList, getStaffList, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { CheckCircleFilled, CloseCircleFilled, DeleteFilled, PlusOutlined } from '@ant-design/icons';

import ScrollX from 'components/ScrollX';
import useGetList from 'hooks/useGetList';
import DownloadIcon from '@mui/icons-material/Download';
import FormReject from 'components/FormReject';
import ConfirmationC from 'components/ConfirmationC';
import useAuth from 'hooks/useAuth';
import FormShiftComponent from './FormShift';

const CONSTANT_DIALOG_CONFIRMATION = { isApprove: false, isReject: false, isDelete: false };
const TabShiftComponent = (props) => {
  const { type } = props;
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [dialog, setDialog] = useState(CONSTANT_DIALOG_CONFIRMATION);

  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [dropDownLocationList, setDropDownLocationList] = useState([]);
  const [selectedFilterStaff, setFilterStaff] = useState([]);
  const [dropDownStaffList, setDropDownStaffList] = useState([]);

  const [selectedRow, setSelectedRow] = useState([]);
  const [openForm, setOpenForm] = useState({ isOpen: false, data: {} });
  const { list, totalPagination, params, setParams, goToPage, keyword, changeKeyword, orderingChange, changeLimit } = useGetList(
    type === 'full' ? getFullShiftData : getLongShiftData,
    { locationId: [], staffId: [] },
    'keyword'
  );

  const isExclusiveJobName = () =>
    ['hr', 'finance', 'komisaris', 'president director'].includes((user?.jobName || '').toLowerCase()) ||
    user?.role === CONSTANT_ADMINISTRATOR;

  const columnToggleCheckbox = () => {
    return isExclusiveJobName()
      ? [
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
            style: {
              width: '10px'
            }
          }
        ]
      : [];
  };

  const column = useMemo(
    () => [
      ...columnToggleCheckbox(),
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'name',
        Cell: (data) => {
          const id = data.row.original.id;
          const date = data.row.original.fullShiftDate;
          const reason = data.row.original.reason;

          if (isExclusiveJobName()) {
            return <Link onClick={() => setOpenForm({ isOpen: true, data: { id, date, reason } })}>{data.value}</Link>;
          }

          return data.value;
        }
      },
      {
        Header: <FormattedMessage id="position" />,
        accessor: 'jobName'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: (type === 'full' ? 'Full' : 'Long') + ' Shift Date',
        accessor: type === 'full' ? 'fullShiftDate' : 'longShiftDate'
      },
      {
        Header: <FormattedMessage id="reason" />,
        accessor: 'reason'
      },
      {
        Header: 'Status',
        accessor: 'status'
      },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      { Header: <FormattedMessage id="checked-by" />, accessor: 'checkedBy' },
      { Header: 'Notes Checker', accessor: 'reasonChecker' },
      { Header: <FormattedMessage id="checked-at" />, accessor: 'checkedAt' }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onExport = async () => {
    const locations = selectedFilterLocation ? selectedFilterLocation.map((dt) => dt.value) : [];
    const staff = selectedFilterStaff ? selectedFilterStaff.map((dt) => dt.value) : [];

    const exportApi$ = type === 'full' ? exportFullShift : exportLongShift;

    await exportApi$({ locationId: locations, staffId: staff })
      .then(processDownloadExcel)
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  const onConfirm = async (value) => {
    if (value) {
      let payload = { id: selectedRow, status: '', reason: '' };
      const catchSuccessResp = (resp) => {
        if (resp.status === 200) {
          const message = `Success ${dialog.isApprove ? 'approve' : dialog.isReject ? 'reject' : 'delete'} Data`;

          setDialog(CONSTANT_DIALOG_CONFIRMATION);
          dispatch(snackbarSuccess(message));
          setParams((_params) => ({ ..._params }));
        }
      };
      const catchErrResp = (err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      };

      // 0  waiting for approval, 1 approved, 2 reject
      const approvalApi$ = type === 'full' ? approvalFullShift : approvalLongShift;
      if (dialog.isApprove) {
        payload.status = 1;
        await approvalApi$(payload).then(catchSuccessResp).catch(catchErrResp);
      } else if (dialog.isReject) {
        payload.status = 2;
        payload.reason = value;
        await approvalApi$(payload).then(catchSuccessResp).catch(catchErrResp);
      } else if (dialog.isDelete) {
        const deleteApi$ = type === 'full' ? deleteFullShift : deleteLongShift;
        await deleteApi$(selectedRow).then(catchSuccessResp).catch(catchErrResp);
      }
    } else {
      setDialog(CONSTANT_DIALOG_CONFIRMATION);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const locationList = await getLocationList();
      const staffList = await getStaffList();
      setDropDownLocationList(locationList);
      setDropDownStaffList(staffList);
    };

    fetchData();
  }, []);

  return (
    <>
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
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              style={{ height: '41.3px' }}
            />
            {isExclusiveJobName() && (
              <>
                <Autocomplete
                  id="filterLocation"
                  multiple
                  options={dropDownLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
                  limitTags={2}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => {
                    const selectedLocation = selected ? selected.map((dt) => dt.value) : [];
                    setFilterLocation(selected);
                    setParams((_params) => ({ ..._params, locationId: selectedLocation }));
                  }}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />

                <Autocomplete
                  id="filterStaff"
                  multiple
                  options={dropDownStaffList}
                  value={selectedFilterStaff}
                  sx={{ width: 300 }}
                  limitTags={2}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => {
                    const selectedStaff = selected ? selected.map((dt) => dt.value) : [];
                    setFilterStaff(selected);
                    setParams((_params) => ({ ..._params, locationId: selectedStaff }));
                  }}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-staff" />} />}
                />
              </>
            )}
          </Stack>
          <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
            {selectedRow.length > 0 && (
              <>
                <Tooltip title={<FormattedMessage id="approve" />} arrow>
                  <IconButton size="large" color="success" onClick={() => setDialog({ isApprove: true, isReject: false, isDelete: false })}>
                    <CheckCircleFilled />
                  </IconButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="reject" />} arrow>
                  <IconButton
                    size="large"
                    color="warning"
                    onClick={() => setDialog({ isApprove: false, isReject: true, isDelete: false })}
                    style={{ marginTop: 'unset' }}
                  >
                    <CloseCircleFilled />
                  </IconButton>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="delete" />} arrow>
                  <IconButton
                    size="large"
                    color="error"
                    onClick={() => setDialog({ isApprove: false, isReject: false, isDelete: true })}
                    style={{ marginTop: 'unset' }}
                  >
                    <DeleteFilled />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {isExclusiveJobName() && (
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
            )}
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm({ isOpen: true, data: {} })}>
              <FormattedMessage id="new" />
            </Button>
          </Stack>
        </Stack>
        <ScrollX>
          <ReactTable
            columns={column}
            data={list || []}
            totalPagination={totalPagination}
            setPageNumber={params.goToPage}
            setPageRow={params.rowPerPage}
            onOrder={orderingChange}
            onGotoPage={goToPage}
            onPageSize={changeLimit}
            colSpanPagination={11}
          />
        </ScrollX>
      </Stack>
      <FormReject
        open={dialog.isReject}
        title={<FormattedMessage id="confirmation-and-please-fill-in-the-reason" />}
        onSubmit={(reason) => onConfirm(reason)}
        onClose={() => setDialog(CONSTANT_DIALOG_CONFIRMATION)}
      />
      <ConfirmationC
        open={dialog.isApprove || dialog.isDelete}
        title={dialog.isDelete ? <FormattedMessage id="delete" /> : <FormattedMessage id="approve" />}
        content={
          dialog.isDelete ? (
            <FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />
          ) : (
            <FormattedMessage id="are-you-sure-you-want-to-approve-this-data" />
          )
        }
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      {openForm.isOpen && (
        <FormShiftComponent
          type={type}
          open={openForm.isOpen}
          data={openForm.data}
          onClose={(val) => {
            setOpenForm({ isOpen: false, data: {} });
            if (val) setParams((_params) => ({ ..._params }));
          }}
        />
      )}
    </>
  );
};

export default TabShiftComponent;
