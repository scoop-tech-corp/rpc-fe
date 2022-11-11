import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router';
import { LocationDetailProvider as Provider } from './location-detail-context';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';

import LocationDetailHeader from './location-detail-header';
import TabDescription from './components/tab-description';
import TabDetail from './components/tab-detail/tab-detail';
import TabAddresses from './components/tab-addresses';
import TabContact from './components/tab-contact/tab-contact';
import TabPhoto from './components/tab-photo';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

const LocationDetail = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [locationName, setLocationName] = useState('');
  let { code } = useParams();

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

  const onChangeTab = (event, value) => {
    setTabSelected(value);
  };

  const setTitlePage = () => {
    return code ? locationName : <FormattedMessage id="add-location" />;
  };

  return (
    <Provider>
      <HeaderPageCustom title={setTitlePage()} locationBackConfig={{ setLocationBack: true, customUrl: '/location/location-list' }} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <LocationDetailHeader locationName={(val) => setLocationName(val)} />
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="location detail tab">
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
    </Provider>
  );
};

export default LocationDetail;
