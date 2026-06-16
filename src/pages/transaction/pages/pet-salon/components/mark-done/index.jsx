import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getCageFacilityLocationList } from 'pages/location/facility/detail/service';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { markSalonDonePetSalon } from '../../service';

const MarkSalonDone = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState({
    cage: null,
    note: ''
  });

  const [cageList, setCageList] = useState([]);
  const [disabledOk, setDisabledOk] = useState(true);

  useEffect(() => {
    setDisabledOk(!formValue.cage);
  }, [formValue.cage]);

  useEffect(() => {
    const fetchCages = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);
      try {
        const list = await getCageFacilityLocationList([data.locationId]);
        setCageList(list);
      } finally {
        loaderGlobalConfig.setLoader(false);
        loaderService.setManualLoader(false);
      }
    };
    fetchCages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    await markSalonDonePetSalon({
      transactionId: data.transactionId,
      cageId: formValue.cage.value,
      note: formValue.note
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Salon selesai — pet ditempatkan di kandang & notifikasi WA dikirim ke customer'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(false);

  return (
    <ModalC
      title={<FormattedMessage id="mark-salon-done" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      fullWidth
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="body2" color="text.secondary">
            Setelah dikonfirmasi, pet akan ditempatkan di kandang yang dipilih dan notifikasi WhatsApp akan dikirim otomatis ke customer.
          </Typography>
        </Grid>

        {/* Pilih Kandang */}
        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="cage" required>
              Kandang Penempatan
            </InputLabel>
            <Autocomplete
              id="cage"
              options={cageList}
              value={formValue.cage}
              isOptionEqualToValue={(option, val) => option.value === val?.value}
              onChange={(_, selected) => setFormValue((prev) => ({ ...prev, cage: selected }))}
              renderInput={(params) => <TextField {...params} placeholder="Pilih kandang..." />}
            />
          </Stack>
        </Grid>

        {/* Catatan Groomer */}
        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="note">Catatan Groomer (opsional)</InputLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              id="note"
              name="note"
              value={formValue.note}
              onChange={(e) => setFormValue((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Catatan tambahan dari groomer..."
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

MarkSalonDone.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default MarkSalonDone;
