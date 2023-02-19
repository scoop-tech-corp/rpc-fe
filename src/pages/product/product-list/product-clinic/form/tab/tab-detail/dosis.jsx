import { Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useProductClinicFormStore } from '../../product-clinic-form-store';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import InputDecimal from 'components/InputDecimal';

let erorQuantity = { isError: false, errorType: null };

const Dosis = () => {
  const dosageList = useProductClinicFormStore((state) => state.dosage);

  const renderErrorContent = () => {
    switch (erorQuantity.errorType) {
      case 1:
        return 'Mohon cek kembali ada from yang melebihi atau sama dengan to nya';
      case 2:
        return 'Mohon cek kembali ada to yang kurang atau sama dengan from nya';
      case 3:
        return 'Mohon cek kembali ada from yang kurang atau sama dengan to sebelum nya';
      case 4:
        return 'Mohon cek kembali ada dosis yang melebihi dosis sebelum nya';
    }
  };

  const validationForm = (procedure, data, i) => {
    let isError = false;

    if (procedure === 'from') {
      // from tidak boleh lebih dari atau sama dengan to
      if (data[i].from >= data[i].to) {
        isError = true;
        erorQuantity.isError = true;
        erorQuantity.errorType = 1;
      }

      // from tidak boleh kurang dari atau sama dengan to sebelumnya
      if (i > 0 && data[i].from <= data[i - 1].to) {
        isError = true;
        erorQuantity.isError = true;
        erorQuantity.errorType = 3;
      }
    } else if (procedure === 'to') {
      // to tidak boleh kurang dari atau sama dengan from
      if (data[i].to <= data[i].from) {
        isError = true;
        erorQuantity.isError = true;
        erorQuantity.errorType = 2;
      }
    } else if (procedure === 'dosage') {
      // dosage tidak boleh melebihi atau sama dengan dosage sebelumnya
      if (i > 0 && data[i].dosage >= data[i - 1].dosage) {
        isError = true;
        erorQuantity.isError = true;
        erorQuantity.errorType = 4;
      }
    }

    if (!isError) {
      erorQuantity.isError = false;
      erorQuantity.errorType = null;
    }

    return isError;
  };

  const processField = (key, getValue, i) => {
    useProductClinicFormStore.setState((prevState) => {
      const getData = [...prevState.dosage];
      getData[i][key] = getValue;

      return { dosage: getData, productClinicFormError: validationForm(key, getData, i), productClinicFormTouch: true };
    });
  };

  const onFieldChange = (e, i) => {
    const getValue = e.target.name !== 'unit' ? +e.target.value : e.target.value;
    processField(e.target.name, getValue, i);
  };

  const onInputDecimal = (e, i) => {
    const value = e ? parseFloat(e) : '';
    processField('dosage', value, i);
  };

  const onAddDosage = () => {
    useProductClinicFormStore.setState((prevState) => {
      return { dosage: [...prevState.dosage, { from: '', to: '', dosage: '', unit: '' }], productClinicFormTouch: true };
    });
  };

  const onDeleteDosage = (i) => {
    useProductClinicFormStore.setState((prevState) => {
      const setNewData = [...prevState.dosage];
      setNewData.splice(i, 1);

      return { dosage: setNewData, productClinicFormTouch: true };
    });
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="dosage" />}>
        <Grid container spacing={3}>
          {erorQuantity.isError && (
            <Grid item xs={12} sm={12}>
              <div style={{ color: 'red', fontWeight: 'bold' }}>{`*${renderErrorContent()}`}</div>
            </Grid>
          )}

          <Grid item xs={12} sm={12}>
            {dosageList.map((dt, i) => (
              <Grid container spacing={4} key={i}>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={1} style={{ marginTop: '5px' }}>
                    <InputLabel htmlFor="from">
                      <FormattedMessage id="from" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      type="number"
                      id={`from${i}`}
                      name="from"
                      value={dt.from}
                      onChange={(event) => onFieldChange(event, i)}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={1} style={{ marginTop: '5px' }}>
                    <InputLabel>
                      <FormattedMessage id="to" />
                    </InputLabel>
                    <TextField
                      fullWidth
                      type="number"
                      id={`to${i}`}
                      name="to"
                      value={dt.to}
                      onChange={(event) => onFieldChange(event, i)}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Stack spacing={1} style={{ marginTop: '5px' }}>
                    <InputLabel>
                      <FormattedMessage id="dosage" />
                    </InputLabel>
                    <InputDecimal
                      fullWidth
                      type="number"
                      id={`dosage${i}`}
                      value={dt.dosage}
                      valueState={dt.dosage}
                      onChangeOutput={(event) => onInputDecimal(event, i)}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Stack spacing={1} style={{ marginTop: '5px' }}>
                    <InputLabel htmlFor="unit">Unit</InputLabel>
                    <FormControl>
                      <Select id="unit" name="unit" value={dt.unit} onChange={(event) => onFieldChange(event, i)} placeholder="Select unit">
                        <MenuItem value="">
                          <em>Select unit</em>
                        </MenuItem>
                        <MenuItem value={'gr'}>gr</MenuItem>
                        <MenuItem value={'mg'}>mg</MenuItem>
                        <MenuItem value={'ml'}>ml</MenuItem>
                        <MenuItem value={'cc'}>cc</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={1} display="flex" alignItems="flex-end">
                  <IconButton size="large" color="error" onClick={() => onDeleteDosage(i)}>
                    <DeleteFilled />
                  </IconButton>
                </Grid>
              </Grid>
            ))}

            <Button variant="contained" onClick={onAddDosage} startIcon={<PlusOutlined />} style={{ marginTop: '20px' }}>
              Add
            </Button>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

export default Dosis;
