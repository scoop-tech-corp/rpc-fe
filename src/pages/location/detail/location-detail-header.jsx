import { Button, Grid, Typography } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import LocationDetailContext from './location-detail-context';
import axios from 'utils/axios';
import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router';

const LocationDetailHeader = () => {
  let { id } = useParams();
  const { locationDetail, setLocationDetail, locationDetailError } = useContext(LocationDetailContext);

  useEffect(() => {
    console.log('id', id);
    // get detail location when id is exist
    if (id) {
      getDetailLocation();
    }

    // get data static
    getDataStatic();

    // get province list
    getProvinceList();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setTitleLocation = () => {
    if (id) {
      return 'test';
    } else {
      return <FormattedMessage id="add-location" />;
    }
  };

  const getDetailLocation = async () => {
    const getResp = await axios.get('detaillocation', { params: { id } });
    const getData = getResp.data;
    console.log('getDetailLocation', getData);
  };

  const getDataStatic = async () => {
    const getResp = await axios.get('locationnew');
    const getData = getResp.data;

    const mapper = (dt) => {
      return { label: dt.name, value: dt.name };
    };

    const newConstruct = {
      usageList: getData.dataStaticUsage.map(mapper),
      telephoneType: getData.dataStaticTelephone.map(mapper),
      messengerType: getData.dataStaticMessenger.map(mapper)
    };

    setLocationDetail((val) => {
      return { ...val, ...newConstruct };
    });
  };

  const getProvinceList = async () => {
    const getResp = await axios.get('locationprovinsi');
    const getProvince = getResp.data.map((dt) => {
      return {
        label: dt.provinceName,
        value: +dt.id
      };
    });

    setLocationDetail((val) => {
      return { ...val, provinceList: getProvince };
    });
  };

  const onSubmitLocation = () => {
    console.log('locationDetail', locationDetail);
    if (locationDetailError) return;
  };

  return (
    <Grid container sx={{ mb: 2.25 }}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5">{setTitleLocation()}</Typography>
      </Grid>
      <Grid item xs={12} sm={6} textAlign="right">
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={onSubmitLocation} disabled={locationDetailError}>
          <FormattedMessage id="save" />
        </Button>
      </Grid>
    </Grid>
  );
};

LocationDetailHeader.propTypes = {
  locationId: PropTypes.number
};

export default LocationDetailHeader;
