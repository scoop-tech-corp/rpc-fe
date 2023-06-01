import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, TextField } from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';
import { useCustomerFormStore } from '../../customer-form-store';
import { getReferenceList } from 'pages/customer/service';
import { useState } from 'react';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormReference from '../../components/FormReference';

const Reference = () => {
  const [openFormReference, setOpenFormReference] = useState(false);

  const referenceList = useCustomerFormStore((state) => state.referenceList);
  const referenceId = useCustomerFormStore((state) => state.referenceCustomerId);
  const referenceValue = referenceList.find((tl) => tl.value === referenceId) || null;

  const onCloseFormReference = async (val) => {
    if (val) {
      const getList = await getReferenceList();
      useCustomerFormStore.setState({ referenceList: getList });
    }
    setOpenFormReference(false);
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="reference" />}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="reference-from" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={2} md={1} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={() => setOpenFormReference(true)}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={10} md={11}>
                    <Autocomplete
                      id="reference"
                      options={referenceList}
                      value={referenceValue}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        useCustomerFormStore.setState({ referenceCustomerId: selected ? selected.value : null, customerFormTouch: true });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
      <FormReference open={openFormReference} onClose={onCloseFormReference} />
    </>
  );
};

export default Reference;
