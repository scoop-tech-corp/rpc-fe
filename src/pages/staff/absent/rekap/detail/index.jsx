import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel } from '@mui/material';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import configGlobal from '../../../../../config';

const StaffRekapDetail = (props) => {
  const { open, data } = props;

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-absent" />}
        open={open}
        onCancel={() => props.onClose(true)}
        isModalAction={false}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="name" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.name}
              </Grid>
              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="branch-location" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.location}
              </Grid>
              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="attendance-status" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.attendanceStatus}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="homecoming-status" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.homecomingStatus || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="attendance-reason" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.attendanceReason || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="homecoming-reason" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.homecomingReason || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="attendance-photo" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.attendanceImagePath ? (
                  <img alt="attendancePhoto" src={`${configGlobal.apiUrl}${data.attendanceImagePath}`} width="80%" />
                ) : (
                  '-'
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="day" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.day}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="attendance-time" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.attendanceTime}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="homecoming-time" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.homecomingTime || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="duration" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.duration || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="attendance-location" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.attendanceLocation || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="homecoming-location" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.homecomingLocation || '-'}
              </Grid>

              <Grid item xs={12}>
                <InputLabel>{<FormattedMessage id="homecoming-photo" />}</InputLabel>
              </Grid>
              <Grid item xs={12}>
                {data?.homecomingImagePath ? (
                  <img alt="homecomingPhoto" src={`${configGlobal.apiUrl}${data.homecomingImagePath}`} width="80%" />
                ) : (
                  '-'
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

StaffRekapDetail.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default StaffRekapDetail;
