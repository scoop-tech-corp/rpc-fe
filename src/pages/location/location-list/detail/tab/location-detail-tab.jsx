import { Box, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useState } from 'react';
import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import TabDescription from './tab-description';
import TabDetail from './tab-detail/tab-detail';
import TabAddresses from './tab-addresses';
import TabContact from './tab-contact';
import TabPhoto from './tab-photo';

const LocationDetailTab = () => {
  const [tabSelected, setTabSelected] = useState(0);

  const TabPanel = (props) => {
    const { children, value, index } = props;

    return (
      <div role="tabpanel" id={`location-tabpanel-${value}`} aria-labelledby={`location-tab-${value}`}>
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
          <Tab label="Details" id="location-tab-0" aria-controls="location-tabpanel-0" />
          <Tab label={<FormattedMessage id="description" />} id="location-tab-1" aria-controls="location-tabpanel-1" />
          <Tab label={<FormattedMessage id="addresses" />} id="location-tab-2" aria-controls="location-tabpanel-2" />
          <Tab label={<FormattedMessage id="contacts" />} id="location-tab-3" aria-controls="location-tabpanel-3" />
          <Tab label={<FormattedMessage id="photos" />} id="location-tab-4" aria-controls="location-tabpanel-4" />
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
          <TabAddresses />
        </TabPanel>
        <TabPanel value={tabSelected} index={3}>
          <TabContact />
        </TabPanel>
        <TabPanel value={tabSelected} index={4}>
          <TabPhoto />
        </TabPanel>
      </Box>
    </MainCard>
  );
};

export default LocationDetailTab;
