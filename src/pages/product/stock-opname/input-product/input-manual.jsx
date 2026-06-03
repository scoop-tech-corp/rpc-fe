import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Autocomplete, CircularProgress, Stack, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getProductClinicDropdown, getProductSellDropdown } from 'pages/product/product-list/service';
import PropTypes from 'prop-types';

const ManualInput = ({ locationId, onAdd }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationId) return;
    setLoading(true);
    Promise.all([getProductSellDropdown(locationId), getProductClinicDropdown(locationId)])
      .then(([sell, clinic]) => setOptions([...sell, ...clinic]))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationId]);

  const handleChange = (_, value) => {
    if (!value) return;
    onAdd({
      productId: value.value,
      productName: value.label,
      stockSystem: value.data?.stock ?? 0
    });
    setSelected(null);
  };

  return (
    <Stack spacing={2}>
      <Autocomplete
        options={options}
        value={selected}
        isOptionEqualToValue={(option, val) => option.value === val.value}
        onChange={handleChange}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label={<FormattedMessage id="search-product" />}
            placeholder={intl.formatMessage({ id: 'search-product' })}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <CircularProgress color="inherit" size={16} />}
                  {params.InputProps.endAdornment}
                </>
              )
            }}
          />
        )}
      />
    </Stack>
  );
};

ManualInput.propTypes = {
  locationId: PropTypes.number,
  onAdd: PropTypes.func
};

export default ManualInput;
