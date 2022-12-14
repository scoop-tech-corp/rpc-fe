import { Grid, Container, Stack, InputLabel, TextField } from '@mui/material';

import { FormattedMessage } from 'react-intl';
import { useState } from 'react';

import MainCard from 'components/MainCard';
import Header from './product-inventory-detail-header';

const ProductInventoryDetail = () => {
  const [formValue, setFormValue] = useState({ requirementName: '', locationId: null, listProduct: [] });
  const [formError, setFormError] = useState({ nameErr: '' });

  const onCheckValidation = () => {
    const getReqName = formValue.requirementName;
    let reqNameErr = null;
    console.log('getReqName', getReqName);
    if (!getReqName) {
      reqNameErr = 'Requirement name is requiredasd';
    }

    if (reqNameErr) {
      setFormError((prevState) => ({ ...prevState, nameErr: reqNameErr }));
    } else {
      setFormError((prevState) => ({ ...prevState, nameErr: '' }));
    }
  };

  const onFieldHandler = (event) => {
    setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
    setTimeout(() => onCheckValidation(), 10000);
  };

  return (
    <>
      <Header />
      <MainCard border={false} boxShadow>
        <Container>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
                <TextField
                  fullWidth
                  id="requirementName"
                  name="requirementName"
                  value={formValue.requirementName}
                  onChange={onFieldHandler}
                  error={Boolean(formError.nameErr && formError.nameErr.length > 0)}
                  helperText={formError.nameErr}
                />
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </MainCard>
    </>
  );
};

export default ProductInventoryDetail;
