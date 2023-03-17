import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Stack, Tab, Tabs, Button, useMediaQuery, Autocomplete, TextField } from '@mui/material';
import { GlobalFilter } from 'utils/react-table';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { exportStaffLeave, exportStaffLeaveBalance } from './service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { jsonCentralized } from 'utils/func';

import useAuth from 'hooks/useAuth';
import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import DownloadIcon from '@mui/icons-material/Download';
import StaffLeavePending from './staff-leave-pending';
import StaffLeaveApproved from './staff-leave-approved';
import StaffLeaveRejected from './staff-leave-rejected';
import StaffLeaveBalance from './staff-leave-balance';
import FormRequestLeave from './form-request-leave';
import TabPanel from 'components/TabPanelC';
import IconButton from 'components/@extended/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

//--- CREATE STORE ----//
import { create } from 'zustand';
const defaultIndexParam = {
  rowPerPage: 5,
  goToPage: 1,
  orderValue: '',
  orderColumn: '',
  keyword: '',
  status: 'pending',
  locationId: [],
  isRefresh: false,
  dateRange: null
};
export const useStaffLeaveIndexStore = create(() => jsonCentralized(defaultIndexParam));
export const getAllState = () => useStaffLeaveIndexStore.getState();
//--------------------//

const staffLeaveTab = [
  { key: 0, value: 'pending' },
  { key: 1, value: 'approve' },
  { key: 2, value: 'reject' },
  { key: 3, value: 'balance' }
];

const StaffLeave = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [keywordSearch, setKeywordSearch] = useState('');
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [facilityLocationList, setFacilityLocationList] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);

  const [doneRender, setDoneRender] = useState(false);
  const [openFormRequest, setOpenFormRequest] = useState(false);

  const { user } = useAuth();
  const intl = useIntl();
  const theme = useTheme();
  const dispatch = useDispatch();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const roleHaveAction = ['administrator', 'office'];

  const onChangeTab = (value) => {
    const tempStatus = staffLeaveTab.find((d) => d.key === value).value;
    useStaffLeaveIndexStore.setState({ rowPerPage: 5, goToPage: 1, orderValue: '', orderColumn: '', status: tempStatus });

    setTabSelected(value);
  };

  const onExport = async () => {
    const respSuccess = (resp) => {
      let blob = new Blob([resp.data], { type: resp.headers['content-type'] });
      let downloadUrl = URL.createObjectURL(blob);
      let a = document.createElement('a');
      const fileName = resp.headers['content-disposition'].split('filename=')[1].split(';')[0];

      a.href = downloadUrl;
      a.download = fileName.replace('.xlsx', '').replaceAll('"', '');
      document.body.appendChild(a);
      a.click();
    };

    const respError = (err) => {
      if (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    };

    if (tabSelected === 3 || tabSelected === 'balance') {
      await exportStaffLeaveBalance(getAllState()).then(respSuccess).catch(respError);
    } else {
      await exportStaffLeave(getAllState()).then(respSuccess).catch(respError);
    }
  };

  const onRefresh = () => useStaffLeaveIndexStore.setState({ isRefresh: true });

  const onFilterDateRange = (selectedDate) => {
    useStaffLeaveIndexStore.setState({ dateRange: selectedDate });
    setSelectedDateRange(selectedDate);
  };

  const onFilterLocation = (selected) => {
    useStaffLeaveIndexStore.setState({ locationId: selected.map((dt) => dt.value) });
    setFilterLocation(selected);
  };

  const onSearch = (event) => {
    useStaffLeaveIndexStore.setState({ keyword: event ?? '' });
    setKeywordSearch(event);
  };

  const clearParamFetchData = () => {
    useStaffLeaveIndexStore.setState(defaultIndexParam);
    setKeywordSearch('');
  };

  const getDataAdditional = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // hit get location
      const data = await getLocationList();
      setFacilityLocationList(data);

      setDoneRender(true);
      resolve(true);
    });
  };

  const getData = async () => await getDataAdditional();

  useEffect(() => {
    clearParamFetchData();
    getData();

    return () => {
      useStaffLeaveIndexStore.setState(jsonCentralized(defaultIndexParam));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="staff-leave" />} isBreadcrumb={true} />
      <MainCard border={false} boxShadow style={{ overflow: 'unset' }}>
        <Stack spacing={3}>
          <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="space-between" alignItems="center" spacing={1} sx={{ pb: 2 }}>
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              <GlobalFilter
                placeHolder={intl.formatMessage({ id: 'search' })}
                globalFilter={keywordSearch}
                setGlobalFilter={onSearch}
                style={{ height: '41.3px' }}
              />
              {roleHaveAction.includes(user?.role) && (
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={facilityLocationList}
                  value={selectedFilterLocation}
                  sx={{ width: 300 }}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, value) => onFilterLocation(value)}
                  renderInput={(params) => <TextField {...params} label={<FormattedMessage id="filter-location" />} />}
                />
              )}
              {tabSelected !== 3 && (
                <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
              )}
            </Stack>
            <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
              {tabSelected !== 3 && (
                <IconButton size="medium" variant="contained" aria-label="refresh" color="primary" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              )}
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              {tabSelected !== 3 && (
                <Button variant="contained" onClick={() => setOpenFormRequest(true)}>
                  <FormattedMessage id="request" />
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="staff leave tab"
          >
            <Tab label={<FormattedMessage id="pending" />} id="staff-leave-tab-0" aria-controls="staff-leave-tabpanel-0" />
            <Tab label={<FormattedMessage id="approved" />} id="staff-leave-tab-1" aria-controls="staff-leave-tabpanel-1" />
            <Tab label={<FormattedMessage id="rejected" />} id="staff-leave-tab-2" aria-controls="staff-leave-tabpanel-2" />
            <Tab
              label={<FormattedMessage id="balance" />}
              style={{ marginLeft: 'auto' }}
              id="staff-leave-tab-3"
              aria-controls="staff-leave-tabpanel-3"
            />
          </Tabs>
        </Box>
        {doneRender && (
          <Box sx={{ mt: 2.5 }}>
            <TabPanel value={tabSelected} index={0} name="staff-leave">
              <StaffLeavePending />
            </TabPanel>
            <TabPanel value={tabSelected} index={1} name="staff-leave">
              <StaffLeaveApproved />
            </TabPanel>
            <TabPanel value={tabSelected} index={2} name="staff-leave">
              <StaffLeaveRejected />
            </TabPanel>
            <TabPanel value={tabSelected} index={3} name="staff-leave">
              <StaffLeaveBalance />
            </TabPanel>
          </Box>
        )}
      </MainCard>

      {openFormRequest && tabSelected !== 3 && (
        <FormRequestLeave open={openFormRequest} onClose={() => setOpenFormRequest(false)} userId={user.id} />
      )}
    </>
  );
};

export default StaffLeave;
