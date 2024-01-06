import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Tab, Tabs } from '@mui/material';
import { getDetailProfile } from '../service';
import { useParams } from 'react-router';

import MainCard from 'components/MainCard';
import HeaderCustom from 'components/@extended/HeaderPageCustom';
import TabPanel from 'components/TabPanelC';
import TabPersonal from './tab-personal';
import TabChangePassword from './tab-change-password';

const StaffEditProfile = () => {
  const [tabSelected, setTabSelected] = useState(0);
  const [dataProfile, setDataProfile] = useState({ isDoneLoad: false, data: null });
  let { id } = useParams();

  const onChangeTab = (value) => setTabSelected(value);

  const loadDetail = async () => {
    const getResp = await getDetailProfile({ id: id, type: 'edit' });
    setDataProfile({ isDoneLoad: true, data: getResp.data });
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="edit-user-profile" />} />
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="edit user profile tab"
          >
            <Tab label="Personal" id="edit-userprofile-tab-0" aria-controls="edit-userprofile-tabpanel-0" />
            <Tab
              label={<FormattedMessage id="change-password" />}
              id="edit-userprofile-tab-1"
              aria-controls="edit-userprofile-tabpanel-1"
            />
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="edit-userprofile">
            {dataProfile.isDoneLoad && <TabPersonal dataProfile={{ ...dataProfile.data, id }} />}
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="edit-userprofile">
            <TabChangePassword />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
};

export default StaffEditProfile;
