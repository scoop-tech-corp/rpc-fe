import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useStaffFormStore } from '../../staff-form-store';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getPayPeriodList } from 'pages/staff/staff-list/service';

import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import FormPayPeriod from 'components/FormPayPeriod';

const Compensation = () => {
  const annualSickAllowance = useStaffFormStore((state) => state.annualSickAllowance);
  const annualLeaveAllowance = useStaffFormStore((state) => state.annualLeaveAllowance);
  const payAmount = useStaffFormStore((state) => state.payAmount);

  const payPeriodId = useStaffFormStore((state) => state.payPeriodId);
  const payPeriodList = useStaffFormStore((state) => state.payPeriodList);
  const payPeriodValue = payPeriodList.find((val) => val.value === payPeriodId) || null;

  const [openFormPayPeriod, setOpenFormPayPeriod] = useState(false);

  const onFieldHandler = (event) => {
    useStaffFormStore.setState({ [event.target.name]: event.target.value, staffFormTouch: true });
  };

  const onAddPayPeriod = () => setOpenFormPayPeriod(true);

  const onCloseFormPayPeriod = async (val) => {
    if (val) {
      setOpenFormPayPeriod(false);
      const getPayPeriod = await getPayPeriodList();
      useStaffFormStore.setState({ payPeriodList: getPayPeriod });
    }
  };

  return (
    <>
      <MainCard title={<FormattedMessage id="compensation" />}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="annual-sick-allowance">{<FormattedMessage id="annual-sick-allowance" />}</InputLabel>
              <TextField
                fullWidth
                type="number"
                id="annual-sick-allowance"
                name="annualSickAllowance"
                value={annualSickAllowance}
                onChange={onFieldHandler}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="annual-leave-allowance">{<FormattedMessage id="annual-leave-allowance" />}</InputLabel>
              <TextField
                fullWidth
                type="number"
                id="annual-leave-allowance"
                name="annualLeaveAllowance"
                value={annualLeaveAllowance}
                onChange={onFieldHandler}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={12}>
                <InputLabel>
                  <FormattedMessage id="pay-period" />
                </InputLabel>
              </Grid>
              <Grid item xs={12} sm={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3} sm={3} md={2} display="flex" alignItems="center">
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddPayPeriod}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                  <Grid item xs={9} sm={9} md={10}>
                    <Autocomplete
                      id="pay-period"
                      options={payPeriodList}
                      value={payPeriodValue}
                      onChange={(_, selected) => {
                        useStaffFormStore.setState({ payPeriodId: selected ? selected.value : null, staffFormTouch: true });
                      }}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Stack spacing={1}>
              <InputLabel htmlFor="pay-amount">{<FormattedMessage id="pay-amount" />} (RP)</InputLabel>
              <TextField id="pay-amount" name="payAmount" fullWidth type="number" value={payAmount} onChange={onFieldHandler} />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
      <FormPayPeriod open={openFormPayPeriod} onClose={onCloseFormPayPeriod} />
    </>
  );
};

export default Compensation;
