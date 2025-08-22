import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import TabShiftComponent from './tab-shift';

const StaffOverWork = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const onChangeTab = (value) => setTabSelected(value);

  return (
    <>
      <HeaderPageCustom title={'Staff Overwork'} isBreadcrumb={true} />
      <MainCard sx={{ overflow: 'visible' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="staff overwork tab"
          >
            <Tab label={'Full Shift'} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={'Long Shift'} id="tab-1" aria-controls="tabpanel-1" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="staff-overwork-list">
            <TabShiftComponent type="full" />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="staff-overwork-list">
            <TabShiftComponent type="long" />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default StaffOverWork;
