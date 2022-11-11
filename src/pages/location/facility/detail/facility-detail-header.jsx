import { Button, Grid } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import FacilityDetailContext from './facility-detail-context';
import { useContext, useEffect } from 'react';
import { useParams } from 'react-router';
import { FormattedMessage } from 'react-intl';
import axios from 'utils/axios';

const FacilityDetailHeader = ({ facilityName }) => {
  let { code } = useParams();
  const { facilityDetail, facilityDetailError } = useContext(FacilityDetailContext);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  useEffect(() => {
    getDetailFacility();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const getDetailFacility = async () => {
    const getResp = await axios.get('detailfacility', { params: { codeFacility: code } });
    const getData = getResp.data;
    console.log('getDetailFacility', getData);
    facilityName(getData.facilityName);
  };

  const onSubmitFacility = () => {
    console.log('facilityDetail', facilityDetail);
    if (facilityDetailError) return;
  };

  return (
    <Grid container sx={{ mb: 2.25 }}>
      <Grid item xs={12} sm={12} textAlign="right">
        {/* disabled={facilityDetailError} */}
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitFacility}>
          <FormattedMessage id="save" />
        </Button>
      </Grid>
    </Grid>
  );
};

FacilityDetailHeader.propTypes = {
  facilityName: PropTypes.any
};

export default FacilityDetailHeader;
