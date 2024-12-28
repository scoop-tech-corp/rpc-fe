import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import TabPanel from 'components/TabPanelC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import DashboardOverview from './overview';
import DashboardUpcomingBooking from './upcoming-booking';
import DashboardRecentActivity from './recent-activity';

const Dashboard = () => {
  const [tabSelected, setTabSelected] = useState(0);

  return (
    <>
      <HeaderPageCustom title={'Dashboard'} />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => setTabSelected(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="dashboard tab"
        >
          <Tab label={<FormattedMessage id="overview" />} id="dashboard-tab-0" aria-controls="dashboard-tabpanel-0" />
          <Tab label={<FormattedMessage id="upcoming-booking" />} id="dashboard-tab-1" aria-controls="dashboard-tabpanel-1" />
          <Tab label={<FormattedMessage id="recent-activity" />} id="dashboard-tab-2" aria-controls="dashboard-tabpanel-2" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <TabPanel value={tabSelected} index={0} name="dashboard">
          <DashboardOverview />
        </TabPanel>
        <TabPanel value={tabSelected} index={1} name="dashboard">
          <DashboardUpcomingBooking />
        </TabPanel>
        <TabPanel value={tabSelected} index={2} name="dashboard">
          <DashboardRecentActivity />
        </TabPanel>
      </Box>
    </>
  );
};

export default Dashboard;
