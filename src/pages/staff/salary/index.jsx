import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import { CONSTANT_ADMINISTRATOR } from 'constant/role';

import TabPanel from 'components/TabPanelC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import TabSalarySlipt from './tab-salary-slipt';
import useAuth from 'hooks/useAuth';
import TabRequirePersonalData from './tab-require-personal-data';
import TabVerificationData from './tab-verification-data';

const SallarySliptList = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const onChangeTab = (value) => setTabSelected(value);
  const { user } = useAuth();

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="salary" />} isBreadcrumb={true} />
      <MainCard sx={{ overflow: 'visible' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="sllary slipt tab"
          >
            <Tab label={<FormattedMessage id="salary-slipt" />} id="tab-0" aria-controls="tabpanel-0" />
            <Tab label={<FormattedMessage id="verfication-data" />} id="tab-1" aria-controls="tabpanel-1" />
            <Tab label={<FormattedMessage id="require-personal-data" />} id="tab-2" aria-controls="tabpanel-2" />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="salary-slipt-list">
            <TabSalarySlipt />
          </TabPanel>
          {(user?.role === CONSTANT_ADMINISTRATOR ||
            ['hr', 'finance', 'komisaris', 'president director'].includes((user?.jobName || '').toLowerCase())) && (
            <>
              <TabPanel value={tabSelected} index={1} name="salary-slipt-list">
                <TabVerificationData />
              </TabPanel>
              <TabPanel value={tabSelected} index={2} name="salary-slipt-list">
                <TabRequirePersonalData />
              </TabPanel>
            </>
          )}
        </Box>
      </MainCard>
    </>
  );
};

export default SallarySliptList;
