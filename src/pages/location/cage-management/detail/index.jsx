import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import useAuth from 'hooks/useAuth';

import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

import { getCageDetail } from '../service';
import TabInfo from './tabs/TabInfo';
import TabInspeksi from './tabs/TabInspeksi';
import TabMaintenance from './tabs/TabMaintenance';
import TabCleaningLog from './tabs/TabCleaningLog';

const JOB_HELPER = 'Helper';
const JOB_PARAMEDIS = 'Paramedis';
const JOB_VETNURSE = 'Vetnurse';

const conditionColor = { baik: 'success', perlu_perhatian: 'warning', tidak_layak: 'error' };
const conditionLabel = { baik: 'Baik', perlu_perhatian: 'Perlu Perhatian', tidak_layak: 'Tidak Layak' };

export default function CageManagementDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [cage, setCage] = useState(null);
  const [tabSelected, setTab] = useState(0);

  const role = user?.role?.toLowerCase() ?? '';
  const jobName = user?.jobName ?? '';

  const isAdminOrManager = ['administrator', 'manager'].includes(role);
  const canInspect = isAdminOrManager || [JOB_HELPER, JOB_PARAMEDIS, JOB_VETNURSE].includes(jobName);
  const canLog = isAdminOrManager || [JOB_HELPER, JOB_PARAMEDIS, JOB_VETNURSE].includes(jobName);

  const load = useCallback(() => {
    getCageDetail(id)
      .then((res) => setCage(res?.data ?? null))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  }, [id, dispatch]);

  useEffect(() => {
    load();
  }, [id, load]);

  return (
    <>
      <HeaderPageCustom
        title={
          cage ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5">{cage.cageName}</Typography>
              <Chip size="small" label={cage.locationName} variant="outlined" />
              {cage.conditionStatus && (
                <Chip size="small" label={conditionLabel[cage.conditionStatus]} color={conditionColor[cage.conditionStatus]} />
              )}
              {cage.isOccupied && <Chip size="small" label="Terisi" color="error" />}
            </Box>
          ) : (
            'Detail Kandang'
          )
        }
        locationBackConfig={{ setLocationBack: true, customUrl: '/location/cage-management' }}
      />

      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabSelected} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label="Info" id="cage-tab-0" />
            <Tab label="Inspeksi" id="cage-tab-1" />
            <Tab label="Maintenance" id="cage-tab-2" />
            <Tab label="Cleaning Log" id="cage-tab-3" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="cage">
            <TabInfo cage={cage} isAdminOrManager={isAdminOrManager} onRefresh={load} />
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="cage">
            <TabInspeksi cageId={+id} canInspect={canInspect} />
          </TabPanel>
          <TabPanel value={tabSelected} index={2} name="cage">
            <TabMaintenance cageId={+id} isAdminOrManager={isAdminOrManager} />
          </TabPanel>
          <TabPanel value={tabSelected} index={3} name="cage">
            <TabCleaningLog cageId={+id} canLog={canLog} />
          </TabPanel>
        </Box>
      </MainCard>
    </>
  );
}
