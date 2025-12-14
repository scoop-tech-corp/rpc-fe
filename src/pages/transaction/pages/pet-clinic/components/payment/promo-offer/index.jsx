import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Autocomplete, Button, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { submitTransactionPetClinicDiscount } from '../../../service';
import { createMessageBackend } from 'service/service-global';
import { snackbarError } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const INITIAL_STATE_PROMO = {
  freeItems: [],
  discounts: [],
  bundles: [],
  basedSales: null
};

const PromoOfferTransactionPetClinic = (props) => {
  const [promoData] = useState(props.data);
  const [disabledOke, setDisabledOk] = useState(false);
  const [formValue, setFormValue] = useState(INITIAL_STATE_PROMO);
  const dispatch = useDispatch();

  const renderPromoAutocomplete = (id, labelId, key, multiple = true) => (
    <Grid item xs={12}>
      <Stack spacing={1}>
        <InputLabel htmlFor={id}>
          <FormattedMessage id={labelId} />
        </InputLabel>
        <Autocomplete
          id={id}
          multiple={multiple}
          options={promoData[key]}
          value={getSelectedObjects(key, multiple)}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => {
            return option.id === value.id;
          }}
          onChange={handlePromoChange(key, multiple)}
          renderInput={(params) => <TextField {...params} placeholder="Select..." />}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <div>
                <strong>{option.name}</strong>
                <br />
                <small>{option.note}</small>
              </div>
            </li>
          )}
        />
      </Stack>
    </Grid>
  );

  const handlePromoChange = (key, multiple) => (_, selectedObjects) => {
    const selectedIds = multiple ? selectedObjects.map((item) => item.id) : selectedObjects?.id || null;

    setFormValue((prev) => ({
      ...prev,
      [key]: selectedIds
    }));
  };

  const getSelectedObjects = (key, multiple) => {
    const ids = formValue[key];
    return multiple ? promoData[key].filter((item) => ids.includes(item.id)) : promoData[key].find((item) => item.id === ids);
  };

  const onSubmit = async () => {
    console.log({
      freeItems: formValue.freeItems,
      discounts: formValue.discounts,
      bundles: formValue.bundles,
      basedSales: formValue.basedSales
    });

    try {
      const promoResponse = await submitTransactionPetClinicDiscount({
        transactionPetClinicId: promoData.transactionPetClinicId,
        freeItems: formValue.freeItems,
        discounts: formValue.discounts,
        bundles: formValue.bundles,
        basedSales: formValue.basedSales,
        recipes: promoData.recipes,
        services: promoData.services,
        products: promoData.products
      });
      console.log('promoResponse', promoResponse);
      props.onClose(promoResponse.data);
    } catch (error) {
      if (error) dispatch(snackbarError(createMessageBackend(error)));
    }
  };

  return (
    <ModalC
      title={<FormattedMessage id="promo-available" />}
      open={props.open}
      onOk={() => onSubmit()}
      disabledOk={disabledOke}
      onCancel={() => props.onClose(false)}
      fullWidth
      maxWidth="sm"
      otherDialogAction={
        <>
          <Button disabled={disabledOke} variant="outlined" onClick={() => setFormValue(INITIAL_STATE_PROMO)}>
            {<FormattedMessage id="reset-all" />}
          </Button>
        </>
      }
    >
      <Grid container spacing={3}>
        {renderPromoAutocomplete('freeItems', 'free-product', 'freeItems')}
        {renderPromoAutocomplete('discounts', 'discount', 'discounts')}
        {renderPromoAutocomplete('bundles', 'bundle', 'bundles')}
        {renderPromoAutocomplete('basedSales', 'based-on-purchase', 'basedSales', false)}
      </Grid>
    </ModalC>
  );
};

PromoOfferTransactionPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default PromoOfferTransactionPetClinic;
