import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useState, useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import FacilityDetailContext from '../facility-detail-context';

const TabDescription = () => {
  const [description, setDescription] = useState('');
  const [introduction, setIntroduction] = useState('');
  const { facilityDetail, setFacilityDetail } = useContext(FacilityDetailContext);

  useEffect(() => {
    // fill context to form
    setDescription(facilityDetail.description);
    setIntroduction(facilityDetail.introduction);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDescription = (event) => {
    setDescription(event.target.value);

    setFacilityDetail((value) => {
      return { ...value, description: event.target.value };
    });
  };

  const onIntroduction = (event) => {
    setIntroduction(event.target.value);

    setFacilityDetail((value) => {
      return { ...value, introduction: event.target.value };
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title={<FormattedMessage id="overview" />}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="description">{<FormattedMessage id="description" />}</InputLabel>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  value={description}
                  onChange={onDescription}
                  onBlur={onDescription}
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="introduction">{<FormattedMessage id="introduction" />}</InputLabel>
                <TextField
                  fullWidth
                  id="introduction"
                  name="introduction"
                  value={introduction}
                  onChange={onIntroduction}
                  onBlur={onIntroduction}
                />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabDescription;
