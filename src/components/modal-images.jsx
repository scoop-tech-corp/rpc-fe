import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel } from '@mui/material';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import MainCard from 'components/MainCard';

const ModalImages = (props) => {
  const onCancel = () => props.onClose();

  return (
    <ModalC
      title={<FormattedMessage id="image" />}
      cancelText={<FormattedMessage id="cancel" />}
      open={props.open}
      onCancel={onCancel}
      isModalAction={false}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="lg"
    >
      <Grid container spacing={3}>
        {props.images.map((dt, i) => {
          if (dt.status === '') {
            return (
              <>
                <Grid item xs={6} sm={3} key={i}>
                  <MainCard>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <div>
                          {dt.imagePath && (
                            <a href={dt.imagePath} target="blank">
                              <img alt={i} src={dt.imagePath} width="100%" />
                            </a>
                          )}
                        </div>
                      </Grid>
                      <Grid item xs={12}>
                        <InputLabel>{dt.label}</InputLabel>
                      </Grid>
                    </Grid>
                  </MainCard>
                </Grid>
              </>
            );
          }
        })}
      </Grid>
    </ModalC>
  );
};

ModalImages.propTypes = {
  open: PropTypes.bool,
  images: PropTypes.array,
  onClose: PropTypes.func
};

export default ModalImages;
