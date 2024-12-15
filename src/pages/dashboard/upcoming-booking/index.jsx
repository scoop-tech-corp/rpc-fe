import { useEffect, useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getDashboardUpbookingInPatient, getDashboardUpbookingOutPatient } from '../service';

import TabPanel from 'components/TabPanelC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';

const DashboardUpcomingBooking = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [inapData, setInapData] = useState({ data: [], totalPagination: 0 });
  const [jalanData, setJalanData] = useState({ data: [], totalPagination: 0 });
  const dispatch = useDispatch();

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="start-time" />, accessor: 'startTime', isNotSorting: true },
      { Header: <FormattedMessage id="end-time" />, accessor: 'endTime', isNotSorting: true },
      { Header: <FormattedMessage id="location" />, accessor: 'location', isNotSorting: true },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer', isNotSorting: true },
      { Header: <FormattedMessage id="service-name" />, accessor: 'serviceName', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="status" />, accessor: 'status', isNotSorting: true },
      { Header: <FormattedMessage id="booking-note" />, accessor: 'bookingNote', isNotSorting: true }
    ],
    []
  );

  const fetchData = async () => {
    await getDashboardUpbookingInPatient()
      .then((resp) => {
        setInapData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });

    await getDashboardUpbookingOutPatient()
      .then((resp) => {
        setJalanData({ data: resp.data.data, totalPagination: resp.data.totalPagination });
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <MainCard content={true}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => setTabSelected(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="dashboard upcoming booking tab"
          >
            <Tab label={'Inap'} id="dashboard-upcoming-booking-tab-0" aria-controls="dashboard-upcoming-booking-tabpanel-0" />
            <Tab label={'Jalan'} id="dashboard-upcoming-booking-tab-1" aria-controls="dashboard-upcoming-booking-tabpanel-1" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable columns={columns} data={inapData.data} totalPagination={inapData.totalPagination} colSpanPagination={8} />
            </ScrollX>
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="dashboard-upcoming-booking">
            <ScrollX>
              <ReactTable columns={columns} data={jalanData.data} totalPagination={jalanData.totalPagination} colSpanPagination={8} />
            </ScrollX>
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default DashboardUpcomingBooking;
