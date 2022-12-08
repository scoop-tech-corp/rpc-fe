import { Grid } from '@mui/material';
import { useParams } from 'react-router';
import BasicInfo from './basic-info';
import UnitsAvailable from './units-available';

const TabDetail = () => {
  let { id } = useParams();

  return (
    <Grid container spacing={3}>
      {!id ? (
        <Grid item xs={12} sm={12}>
          <BasicInfo />
        </Grid>
      ) : (
        ''
      )}
      <Grid item xs={12} sm={12}>
        <UnitsAvailable />
      </Grid>
    </Grid>
  );
};

export default TabDetail;
