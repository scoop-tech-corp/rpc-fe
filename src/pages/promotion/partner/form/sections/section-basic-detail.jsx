import { FormattedMessage } from 'react-intl';
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';

const PromotionPartnerBasicDetail = ({ form, setForm, formError }) => {
  const onFieldHandler = (event) => {
    setForm((prevState) => ({
      ...prevState,
      basicDetail: { ...prevState.basicDetail, ...{ [event.target.name]: event.target.value } },
      is_form_touched: true
    }));
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="basic-detail" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="name">{<FormattedMessage id="name" />}</InputLabel>
              <TextField
                fullWidth
                id="name"
                name="name"
                value={form.basicDetail.name}
                onChange={onFieldHandler}
                error={Boolean(formError.nameErr)}
                helperText={formError.nameErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="status">Status</InputLabel>
              <FormControl error={Boolean(formError.statusErr)}>
                <Select id="status" name="status" value={form.basicDetail.status} onChange={onFieldHandler} placeholder="Select status">
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-status" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'1'}>
                    <FormattedMessage id="active" />
                  </MenuItem>
                  <MenuItem value={'0'}>
                    <FormattedMessage id="inactive" />
                  </MenuItem>
                </Select>
                {formError.statusErr && <FormHelperText error> {formError.statusErr} </FormHelperText>}
              </FormControl>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
};

PromotionPartnerBasicDetail.propTypes = {
  form: PropTypes.object,
  setForm: PropTypes.func,
  formError: PropTypes.object
};

export default PromotionPartnerBasicDetail;
