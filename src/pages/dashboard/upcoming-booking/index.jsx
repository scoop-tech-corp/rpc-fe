import { useMemo, useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';

import TabPanel from 'components/TabPanelC';
import MainCard from 'components/MainCard';

const DashboardUpcomingBooking = () => {
  const [tabSelected, setTabSelected] = useState(0);

  const columnsTable = useMemo(
    () => [
      { Header: <FormattedMessage id="start-time" />, accessor: 'startTime', isNotSorting: true },
      { Header: <FormattedMessage id="end-time" />, accessor: 'endTime', isNotSorting: true },
      { Header: <FormattedMessage id="location" />, accessor: 'location', isNotSorting: true },
      { Header: <FormattedMessage id="customer" />, accessor: 'customer', isNotSorting: true },
      { Header: <FormattedMessage id="service-name" />, accessor: 'service_name', isNotSorting: true },
      { Header: <FormattedMessage id="staff" />, accessor: 'staff', isNotSorting: true },
      { Header: <FormattedMessage id="status" />, accessor: 'status', isNotSorting: true },
      { Header: <FormattedMessage id="booking-note" />, accessor: 'booking_note', isNotSorting: true }
    ],
    []
  );

  const dataInap = [
    {
      startTime: '9:00 AM',
      endTime: '9:10 AM',
      location: 'RPC Duren',
      customer: 'Susi',
      service_name: 'service 1',
      staff: 'Agus',
      status: 'On Progress',
      booking_note: 'ceki ceki'
    },
    {
      startTime: '9:00 AM',
      endTime: '9:10 AM',
      location: 'RPC Duren',
      customer: 'Susi',
      service_name: 'service 1',
      staff: 'Agus',
      status: 'On Progress',
      booking_note: 'ceki ceki'
    }
  ];

  const dataJalan = [
    {
      startTime: '10:00 AM',
      endTime: '12:10 Pm',
      location: 'RPC Duren Sawit',
      customer: 'Susi',
      service_name: 'service 1',
      staff: 'Agus',
      status: 'On Progress',
      booking_note: 'ceki ceki'
    },
    {
      startTime: '13:00 PM',
      endTime: '21:10 PM',
      location: 'RPC Karang Tengah',
      customer: 'Bejo',
      service_name: 'service 10',
      staff: 'Agus Triningsi',
      status: 'On Progress',
      booking_note: 'ceki cekidot'
    }
  ];

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
            <ReactTable columns={columnsTable} data={dataInap} />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="dashboard-upcoming-booking">
            <ReactTable columns={columnsTable} data={dataJalan} />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default DashboardUpcomingBooking;
