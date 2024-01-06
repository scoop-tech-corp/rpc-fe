import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Box } from '@mui/material';
import { getLocationList } from 'service/service-global';
import { useEffect, useState } from 'react';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import CategoryDetailContent from './content-tab';

const ServiceCategoryDetail = (props) => {
  const [filterLocationList, setFilterLocationList] = useState([]);

  const onCancel = () => props.onClose(false);

  const getLocation = async () => {
    const data = await getLocationList();
    setFilterLocationList(data);
  };

  useEffect(() => {
    getLocation();
    return () => {};
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="detail-category" />}
      open={props.open}
      isModalAction={false}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '50%', maxHeight: 650 } }}
      maxWidth="xl"
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}>
          <InputLabel>{<FormattedMessage id="category-name" />}</InputLabel>
        </Grid>
        <Grid item xs={12} sm={9}>
          {props.data.categoryName}
        </Grid>

        <Grid item xs={12}>
          <Box>
            {props.open && (
              <CategoryDetailContent data={{ ...props.data, productType: 'clinic' }} filterLocationList={filterLocationList} />
            )}
          </Box>
        </Grid>
      </Grid>
    </ModalC>
  );
};

ServiceCategoryDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ServiceCategoryDetail;
