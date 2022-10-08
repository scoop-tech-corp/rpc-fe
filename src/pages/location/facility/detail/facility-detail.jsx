import { Box, Tab, Tabs } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { FacilityDetailProvider as Provider } from './facility-detail-context';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';
import { FormattedMessage } from 'react-intl';

import FacilityDetailHeader from './facility-detail-header';
import TabDetail from './components/tab-detail/tab-detail';
import TabDescription from './components/tab-description';
import TabPhoto from './components/tab-photo';

const LocationFacilitiesDetail = () => {
  let { id } = useParams();
  const [tabSelected, setTabSelected] = useState(0);

  useEffect(() => {
    console.log('id', id);
  }, [id]);

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

  const onChangeTab = (event, value) => {
    setTabSelected(value);
  };

  return (
    <Provider>
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <FacilityDetailHeader locationId={id} />
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="location detail tab">
            <Tab label="Details" id="facility-tab-0" aria-controls="facility-tabpanel-0" />
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
    </Provider>
  );
};

export default LocationFacilitiesDetail;
