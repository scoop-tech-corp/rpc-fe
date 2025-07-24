import { Box, Button, Grid, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import GroupInput from '../components/GroupInput';
import SimpleInput from '../components/SimpleInput';

const ParamedicForm = ({ formValues, setFormValues, isDetailForm = false }) => {
  useEffect(() => {
    const groupPaths = [
      'income.xrayIncentive',
      'income.longShiftReplacement',
      'income.fullShiftReplacement',
      'expense.notComingToWork',
      'expense.notWearingWorkAttributes',
      'expense.late'
    ];

    let updated = { ...formValues };

    groupPaths.forEach((path) => {
      const [first, second] = path.split('.');
      const group = updated[first]?.[second];

      const amount = Number(group?.amount || 0);
      const unitNominal = Number(group?.unitNominal || 0);
      const total = amount * unitNominal;

      updated = {
        ...updated,
        [first]: {
          ...updated[first],
          [second]: {
            ...updated[first]?.[second],
            total
          }
        }
      };
    });

    setFormValues(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues.income?.xrayIncentive?.amount,
    formValues.income?.xrayIncentive?.unitNominal,
    formValues.income?.longShiftReplacement?.amount,
    formValues.income?.longShiftReplacement?.unitNominal,
    formValues.income?.fullShiftReplacement?.amount,
    formValues.income?.fullShiftReplacement?.unitNominal,
    formValues.expense?.notComingToWork?.amount,
    formValues.expense?.notComingToWork?.unitNominal,
    formValues.expense?.notWearingWorkAttributes?.amount,
    formValues.expense?.notWearingWorkAttributes?.unitNominal,
    formValues.expense?.late?.amount,
    formValues.expense?.late?.unitNominal
  ]);

  const getNestedValue = (obj, path) => path.reduce((acc, key) => acc?.[key], obj) || 0;

  const getTotalIncome = (formValues) => {
    const groupInputs = ['xrayIncentive.total', 'income.longShiftReplacement.total', 'income.fullShiftReplacement.total'];

    const simpleInputs = [
      'income.basicIncome',
      'income.annualIncrementIncentive',
      'income.attendanceAllowance',
      'income.mealAllowance',
      'income.housingAllowance',
      'income.clinicTurnoverBonus',
      'income.bpjsHealthAllowance'
    ];

    const groupTotal = groupInputs.reduce((sum, pathStr) => {
      return sum + Number(getNestedValue(formValues, pathStr.split('.')));
    }, 0);

    const simpleTotal = simpleInputs.reduce((sum, pathStr) => {
      return sum + Number(getNestedValue(formValues, pathStr.split('.')));
    }, 0);

    return groupTotal + simpleTotal;
  };

  const getTotalExpense = (formValues) => {
    const groupInputs = ['expense.notComingToWork.total', 'expense.notWearingWorkAttributes.total', 'expense.late.total'];

    const simpleInputs = ['expense.currentMonthCashAdvance', 'expense.remainingDebtLastMonth', 'expense.stockOpnameInventory'];

    const groupTotal = groupInputs.reduce((sum, pathStr) => {
      return sum + Number(getNestedValue(formValues, pathStr.split('.')));
    }, 0);

    const simpleTotal = simpleInputs.reduce((sum, pathStr) => {
      return sum + Number(getNestedValue(formValues, pathStr.split('.')));
    }, 0);

    return groupTotal + simpleTotal;
  };

  const getNetIncome = (formValues) => {
    return getTotalIncome(formValues) - getTotalExpense(formValues);
  };

  return (
    <>
      <h4>Pemasukkan</h4>

      <Grid container spacing={3}>
        {/* Penghasilan Pokok */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="basicIncome"
          name="basicIncome"
          idMessage="basic-income"
          accessor="income.basicIncome"
        />

        {/* Insentif Kenaikan Tahunan */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="annualIncrementIncentive"
          name="annualIncrementIncentive"
          idMessage="annual-increase-incentive"
          accessor="income.annualIncrementIncentive"
        />

        {/* Tunjangan Kehadiran */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="attendanceAllowance"
          name="attendanceAllowance"
          idMessage="attendance-allowance"
          accessor="income.attendanceAllowance"
        />

        {/* Tunjangan Makan */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="mealAllowance"
          name="mealAllowance"
          idMessage="meal-allowance"
          accessor="income.mealAllowance"
        />

        {/* Tunjangan Tempat Tinggal */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="housingAllowance"
          name="housingAllowance"
          idMessage="housing-allowance"
          accessor="income.housingAllowance"
        />

        {/* Insentif Operator Lab / Xray */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="xrayIncentive"
          name="xrayIncentive"
          groupTitleIdMessage="xray-incentive"
          accessor="income.xrayIncentive"
        />

        {/* Bonus Omset Klinik */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="clinicTurnoverBonus"
          name="clinicTurnoverBonus"
          idMessage="clinic-turnover-bonus"
          accessor="income.clinicTurnoverBonus"
        />

        {/* Upah pengganti longshift */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="longShiftReplacement"
          name="longShiftReplacement"
          groupTitleIdMessage="long-shift-substitute-wage"
          accessor="income.longShiftReplacement"
        />

        {/* Upah pengganti fullshift */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="fullShiftReplacement"
          name="fullShiftReplacement"
          groupTitleIdMessage="full-shift-substitute-wage"
          accessor="income.fullShiftReplacement"
        />

        {/* Tunjangan BPJS Kesehatan */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="bpjsHealthAllowance"
          name="bpjsHealthAllowance"
          idMessage="bpjs-health-allowance"
          accessor="income.bpjsHealthAllowance"
        />

        <Grid item xs={12}>
          <Box textAlign={'end'} fontSize={16}>
            <FormattedMessage id="total-income" />: Rp {formatThousandSeparator(getTotalIncome(formValues))}
          </Box>
        </Grid>
      </Grid>

      <h4>Pengeluaran</h4>

      <Grid container spacing={3}>
        {/* Tidak masuk kerja  */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="notComingToWork"
          name="notComingToWork"
          groupTitleIdMessage="absent"
          accessor="expense.notComingToWork"
        />

        {/* Tidak mengenakan atribut kerja  */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="notWearingWorkAttributes"
          name="notWearingWorkAttributes"
          groupTitleIdMessage="not-wearing-work-attributes"
          accessor="expense.notWearingWorkAttributes"
        />

        {/* Keterlambatan */}
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="late"
          name="late"
          groupTitleIdMessage="late"
          accessor="expense.late"
        />

        {/* Kasbon bulan berjalan */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="currentMonthCashAdvance"
          name="currentMonthCashAdvance"
          idMessage="current-month-cash-advance"
          accessor="expense.currentMonthCashAdvance"
        />

        {/* Sisa hutang bulan lalu */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="remainingDebtLastMonth"
          name="remainingDebtLastMonth"
          idMessage="remaining-debt-from-last-month"
          accessor="expense.remainingDebtLastMonth"
        />

        {/* Stock Opname barang Inventory (klinik) */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="stockOpnameInventory"
          name="stockOpnameInventory"
          idMessage="stock-opname-inventory-product"
          accessor="expense.stockOpnameInventory"
        />

        <Grid item xs={12}>
          <Box textAlign={'end'} fontSize={16}>
            <FormattedMessage id="total-expense" />: Rp {formatThousandSeparator(getTotalExpense(formValues))}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Stack textAlign={'end'} fontSize={16}>
            <h4 style={{ margin: 0 }}>
              <FormattedMessage id="net-income" />
            </h4>
            <div>Rp {formatThousandSeparator(getNetIncome(formValues))}</div>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};

ParamedicForm.propTypes = {
  formValues: PropTypes.object,
  setFormValues: PropTypes.func,
  isDetailForm: PropTypes.bool
};

export default ParamedicForm;
