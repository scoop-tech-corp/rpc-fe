import { Button, Grid, Typography } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import FacilityDetailContext from './facility-detail-context';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';

const FacilityDetailHeader = (props) => {
  const { facilityId } = props;
  const { facilityDetail, facilityDetailError } = useContext(FacilityDetailContext);

  const setTitleFacility = () => {
    if (facilityId) {
      return 'test';
    } else {
      return <FormattedMessage id="add-facility" />;
    }
  };

  const onSubmitFacility = () => {
    console.log('facilityDetail', facilityDetail);
    if (facilityDetailError) return;
  };

  return (
    <Grid container sx={{ mb: 2.25 }}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5">{setTitleFacility()}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} textAlign="right">
        {/* disabled={facilityDetailError} */}
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitFacility}>
          <FormattedMessage id="save" />
        </Button>
      </Grid>
    </Grid>
  );
};

FacilityDetailHeader.propTypes = {
  facilityId: PropTypes.number
};

export default FacilityDetailHeader;
