import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';

import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import StaffManualAbsent from './manual-absent';
import StaffRekap from './rekap';

const StaffAbsent = () => {
  const [tabSelected, setTabSelected] = useState(0);

  const onChangeTab = (value) => setTabSelected(value);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="staff-absent" />} isBreadcrumb={true} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="staff absent tab"
          >
            <Tab label={<FormattedMessage id="manual-absent" />} id="staff-absent-tab-0" aria-controls="staff-absent-tabpanel-0" />
            <Tab label={<FormattedMessage id="recap" />} id="staff-absent-tab-1" aria-controls="staff-absent-tabpanel-1" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="staff-absent">
            <StaffManualAbsent />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="staff-absent">
            <StaffRekap />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default StaffAbsent;
