import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { approvalVerificationData, deleteVerificationData, exportVerificationData, getVerificationData } from '../service';
import { Autocomplete, Button, IconButton, Stack, TextField, Tooltip, useMediaQuery } from '@mui/material';
import { CheckCircleFilled, CloseCircleFilled, DeleteFilled } from '@ant-design/icons';
import { GlobalFilter } from 'utils/react-table';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { getDropdownStaffDataStatic } from 'pages/staff/static-data/service';
import { useTheme } from '@mui/material/styles';

import ScrollX from 'components/ScrollX';
import useGetList from 'hooks/useGetList';
import configGlobal from '../../../../config';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import DownloadIcon from '@mui/icons-material/Download';

const CONSTANT_DIALOG_CONFIRMATION = { isApprove: false, isReject: false, isDelete: false };
const TabVerificationData = () => {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const [dialog, setDialog] = useState(CONSTANT_DIALOG_CONFIRMATION);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [dropDownLocationList, setDropDownLocationList] = useState([]);

  const [selectedFilterJobTitle, setFilterJobTitle] = useState([]);
  const [dropDownJobTitleList, setDropDownJobTitleList] = useState([]);

  const [selectedRow, setSelectedRow] = useState([]);
  const { list, totalPagination, params, setParams, goToPage, keyword, changeKeyword, orderingChange, changeLimit } = useGetList(
    getVerificationData,
    { locationId: [], jobTitleId: [] },
    'keyword'
  );
  const column = useMemo(
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
        style: {
          width: '10px'
        }
      },
      {
        Header: <FormattedMessage id="name" />,
        accessor: 'firstName'
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
        Header: <FormattedMessage id="type-identification" />,
        accessor: 'identification'
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: (data) => {
          return data.row.original.statusText;
        }
      },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt' },
      {
        Header: <FormattedMessage id="image" />,
        accessor: 'imagePath',
        style: {
          width: '250px'
        },
        Cell: (data) => {
          return (
            <a href={`${configGlobal.apiUrl}${data.value}`} target="_blank" rel="noreferrer">
              <img src={`${configGlobal.apiUrl}${data.value}`} width="50%" alt="images" />
            </a>
          );
        }
      },
      { Header: <FormattedMessage id="checked-by" />, accessor: 'approvedBy' }
    ],
    []
  );

  const onExport = async () => {
    const locations = selectedFilterLocation ? selectedFilterLocation.map((dt) => dt.value) : [];
    const jobTitles = selectedFilterJobTitle ? selectedFilterJobTitle.map((dt) => dt.value) : [];

    await exportVerificationData({ locationId: locations, jobTitleId: jobTitles })
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

      // 0 | 1 waiting for approval, 2 approved, 3 reject
      if (dialog.isApprove) {
        payload.status = 2;
        await approvalVerificationData(payload).then(catchSuccessResp).catch(catchErrResp);
      } else if (dialog.isReject) {
        payload.status = 3;
        payload.reason = value;
        await approvalVerificationData(payload).then(catchSuccessResp).catch(catchErrResp);
      } else if (dialog.isDelete) {
        await deleteVerificationData(selectedRow).then(catchSuccessResp).catch(catchErrResp);
      }
    } else {
      setDialog(CONSTANT_DIALOG_CONFIRMATION);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLocationList();
      const { dataStaticJobTitle } = await getDropdownStaffDataStatic();
      setDropDownLocationList(data);
      setDropDownJobTitleList(dataStaticJobTitle);
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
          </Stack>
          <Stack spacing={1} direction={matchDownMD ? 'column' : 'row'} style={{ width: matchDownMD ? '100%' : '' }}>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
              <FormattedMessage id="export" />
            </Button>
            <GlobalFilter
              placeHolder={intl.formatMessage({ id: 'search' })}
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              style={{ height: '41.3px' }}
            />
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
              id="filterJobTitle"
              multiple
              options={dropDownJobTitleList}
              value={selectedFilterJobTitle}
              sx={{ width: 300 }}
              limitTags={2}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, selected) => {
                const selectedJobTitle = selected ? selected.map((dt) => dt.value) : [];
                setFilterJobTitle(selected);
                setParams((_params) => ({ ..._params, jobTitleId: selectedJobTitle }));
              }}
              renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-job-title" />} />}
            />
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
            colSpanPagination={9}
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
    </>
  );
};

export default TabVerificationData;
