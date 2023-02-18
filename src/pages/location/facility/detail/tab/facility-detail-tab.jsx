import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import TabDetail from './tab-detail/tab-detail';
import TabDescription from './tab-description';
import TabPhoto from './tab-photo';

const FacilityDetailTab = () => {
  const [tabSelected, setTabSelected] = useState(0);

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`facility-tabpanel-${value}`} aria-labelledby={`facility-tab-${value}`}>
        {value === index && <>{children}</>}
      </div>
    );
  };
  TabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number,
    index: PropTypes.number
  };

  const onChangeTab = (value) => setTabSelected(value);

  return (
    <MainCard border={false} boxShadow>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
        <Tabs
          value={tabSelected}
          onChange={(_, value) => onChangeTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="location detail tab"
        >
          <Tab label={<FormattedMessage id="details" />} id="facility-tab-0" aria-controls="facility-tabpanel-0" />
          <Tab label={<FormattedMessage id="description" />} id="facility-tab-1" aria-controls="facility-tabpanel-1" />
          <Tab label={<FormattedMessage id="photos" />} id="facility-tab-2" aria-controls="facility-tabpanel-2" />
        </Tabs>
      </Box>
      <Box sx={{ mt: 2.5 }}>
        <TabPanel value={tabSelected} index={0}>
          <TabDetail />
        </TabPanel>
        <TabPanel value={tabSelected} index={1}>
          <TabDescription />
        </TabPanel>
        <TabPanel value={tabSelected} index={2}>
          <TabPhoto />
        </TabPanel>
      </Box>
    </MainCard>
  );
};

export default FacilityDetailTab;
