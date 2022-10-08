import { Grid, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import LocationDetailContext from '../location-detail-context';

const TabDescription = () => {
  const [description, setDescription] = useState('');
  const { locationDetail, setLocationDetail } = useContext(LocationDetailContext);

  const onDescription = (event) => {
    setDescription(event.target.value);

    setLocationDetail((value) => {
      return { ...value, description: event.target.value };
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard title={<FormattedMessage id="overview" />}>
          <TextField
            multiline
            fullWidth
            id="overview"
            name="overview"
            value={description || locationDetail.description}
            rows={5}
            onChange={onDescription}
            onBlur={onDescription}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
};

export default TabDescription;
