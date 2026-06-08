import { Stack, TextField, Typography } from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { extendStayPetHotel } from '../../service';

const ExtendStay = (props) => {
  const { data } = props;
  const dispatch = useDispatch();
  const [newEndDate, setNewEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!newEndDate) return;
    setSubmitting(true);
    await extendStayPetHotel({ transactionId: data.transactionId, newEndDate })
      .then((resp) => {
        if (resp?.status === 200) {
          dispatch(snackbarSuccess('Masa menginap berhasil diperpanjang'));
          props.onClose(true);
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  return (
    <ModalC
      title="Perpanjang Masa Menginap"
      open={props.open}
      onOk={onSubmit}
      onCancel={() => props.onClose(false)}
      okText={submitting ? 'Menyimpan...' : 'Simpan'}
      isOkDisabled={!newEndDate || submitting}
      fullWidth
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Tanggal keluar saat ini: <strong>{data?.currentEndDate || '-'}</strong>
        </Typography>
        <TextField
          label="Tanggal Keluar Baru"
          type="date"
          value={newEndDate}
          onChange={(e) => setNewEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: data?.currentEndDate || '' }}
          fullWidth
          size="small"
        />
      </Stack>
    </ModalC>
  );
};

ExtendStay.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ExtendStay;
