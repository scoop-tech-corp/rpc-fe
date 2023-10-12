import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useServiceFormStore } from '../../service-form-store';

const TabFollowup = () => {
  const followupList = useServiceFormStore((state) => state.dataSupport.serviceList);
  const followupStore = useServiceFormStore((state) => state.followup);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  const [followup, setFollowup] = useState([]);
  const [error, setError] = useState('');

  const onSelectFollowup = (_, val) => {
    setFollowup(val);
    useServiceFormStore.setState({ followup: val });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="follow-up" />
          </InputLabel>
          <Autocomplete
            id="followup"
            multiple
            readOnly={isDetail}
            options={followupList}
            value={followupStore}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={onSelectFollowup}
            renderInput={(params) => (
              <TextField {...params} error={Boolean(error && error.length > 0)} helperText={error} variant="outlined" />
            )}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabFollowup;
