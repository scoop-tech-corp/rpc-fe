import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { InputAdornment, Stack, TextField } from '@mui/material';
import { QrcodeOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getProductByBarcode } from './service';
import PropTypes from 'prop-types';

const BarcodeInput = ({ locationId, onAdd }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);

  const onKeyDown = async (e) => {
    if (e.key !== 'Enter' || !barcode.trim()) return;

    setLoading(true);
    await getProductByBarcode({ locationId, sku: barcode.trim() })
      .then((resp) => {
        onAdd({
          productId: resp.data.id,
          productName: resp.data.productName,
          stockSystem: resp.data.systemQuantity ?? 0
        });
        setBarcode('');
        inputRef.current?.focus();
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      })
      .finally(() => setLoading(false));
  };

  return (
    <Stack spacing={2}>
      <TextField
        inputRef={inputRef}
        autoFocus
        label={intl.formatMessage({ id: 'barcode' })}
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={loading}
        placeholder={intl.formatMessage({ id: 'scan-or-type-barcode' })}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <QrcodeOutlined />
            </InputAdornment>
          )
        }}
        helperText={<FormattedMessage id="press-enter-to-scan" />}
      />
    </Stack>
  );
};

BarcodeInput.propTypes = {
  locationId: PropTypes.number,
  onAdd: PropTypes.func
};

export default BarcodeInput;
