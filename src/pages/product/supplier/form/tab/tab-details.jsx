import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useProductSupplierFormStore } from '../product-supplier-form-store';
import { useEffect, useState } from 'react';

const configErr = {
  supplierNameErr: '',
  picErr: ''
};

const TabDetails = () => {
  const isTouchForm = useProductSupplierFormStore((state) => state.productSupplierFormTouch);
  const supplierName = useProductSupplierFormStore((state) => state.supplierName);
  const pic = useProductSupplierFormStore((state) => state.pic);
  const intl = useIntl();

  const [error, setError] = useState(configErr);

  const onFieldHandler = (event) => {
    useProductSupplierFormStore.setState({ [event.target.name]: event.target.value, productSupplierFormTouch: true });
    onCheckValidation();
  };

  const onCheckValidation = () => {
    const getSupplierName = getAllState().supplierName;
    const getPic = getAllState().pic;

    let supplierNameErr = '';
    let picErr = '';

    if (!getSupplierName) {
      supplierNameErr = intl.formatMessage({ id: 'supplier-name-is-required' });
    }

    if (!getPic) {
      picErr = intl.formatMessage({ id: 'pic-is-required' });
    }

    const setObjErr = { supplierNameErr: '', picErr: '' };

    if (supplierNameErr || picErr) {
      setObjErr.supplierNameErr = supplierNameErr;
      setObjErr.picErr = picErr;
      useProductSupplierFormStore.setState({ productSupplierFormError: true });
    } else {
      useProductSupplierFormStore.setState({ productSupplierFormError: false });
    }

    setError(setObjErr);
  };

  useEffect(() => {
    if (isTouchForm) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="supplier-name">{<FormattedMessage id="supplier-name" />}</InputLabel>
          <TextField
            fullWidth
            id="supplierName"
            name="supplierName"
            value={supplierName}
            onChange={onFieldHandler}
            error={Boolean(error.supplierNameErr && error.supplierNameErr.length > 0)}
            helperText={error.supplierNameErr}
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={1}>
          <InputLabel htmlFor="pic">PIC</InputLabel>
          <TextField
            fullWidth
            id="pic"
            name="pic"
            value={pic}
            onChange={onFieldHandler}
            error={Boolean(error.picErr && error.picErr.length > 0)}
            helperText={error.picErr}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabDetails;
