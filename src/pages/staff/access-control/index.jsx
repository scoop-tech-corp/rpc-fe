import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import TabPanel from 'components/TabPanelC';
import TabSecurityGroup from './tab-security-group';

const StaffAccessControl = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const onChangeTab = (value) => setTabSelected(value);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="access-control" />} isBreadcrumb={true} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="access control tab"
          >
            <Tab label={<FormattedMessage id="security-group" />} id="access-control-tab-0" aria-controls="access-control-tabpanel-0" />
            <Tab label={<FormattedMessage id="all-users" />} id="access-control-tab-1" aria-controls="access-control-tabpanel-1" />
            <Tab label={<FormattedMessage id="history" />} id="access-control-tab-1" aria-controls="access-control-tabpanel-2" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="access-control">
            <TabSecurityGroup />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="access-control"></TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default StaffAccessControl;
