import { Grid, InputLabel } from '@mui/material';
import { Stack } from '@mui/system';
import { FormattedMessage } from 'react-intl';
import { deletePromotionDiscountList } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { createMessageBackend } from 'service/service-global';
import { useNavigate } from 'react-router';

import MainCard from 'components/MainCard';
import ModalC from 'components/ModalC';
import DiscountDetailAction from './button-action';
import ConfirmationC from 'components/ConfirmationC';

const DiscountDetail = (props) => {
  const { id, name, type, customerGroup, location, startDate, endDate, status } = props.data;
  const [customerGroupView] = useState(customerGroup.map((item) => item.customerGroup).join(', '));
  const [locationView] = useState(location.map((item) => item.locationName).join(', '));
  const [dialog, setDialog] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onCancel = () => props.onClose(false);

  const onConfirm = async (value) => {
    if (value) {
      await deletePromotionDiscountList([id])
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Promo'));
            props.onClose(true);
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  return (
    <>
      <ModalC
        title={name}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
        action={{
          element: (
            <DiscountDetailAction
              onAction={(action) => {
                if (action === 'delete') {
                  setDialog({ accept: true, reject: false });
                } else if (action === 'edit') {
                  navigate(`/promotion/discount/form/${id}`, { replace: true });
                } else {
                  // setActive?
                  props.onClose(action);
                }
              }}
            />
          ),
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <MainCard title="Details">
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="type" />
                </InputLabel>
                {type}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="name" />
                </InputLabel>
                {name}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="customer-group" />
                </InputLabel>
                {customerGroupView}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="location" />
                </InputLabel>
                {locationView}
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="start-date" />
                </InputLabel>
                {startDate}
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>
                  <FormattedMessage id="end-date" />
                </InputLabel>
                {endDate}
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Stack spacing={1}>
                <InputLabel>Status</InputLabel>
                {status}
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </ModalC>
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

export default DiscountDetail;
