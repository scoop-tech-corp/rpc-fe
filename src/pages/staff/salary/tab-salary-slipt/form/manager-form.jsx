import { Box, Button, Grid, Stack } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import GroupInput from '../components/GroupInput';
import SimpleInput from '../components/SimpleInput';

const ManagerForm = forwardRef(({ formValues, setFormValues, isDetailForm = false }, ref) => {
  const [errors, setErrors] = useState({});

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const err = {};

      const requiredSimpleFields = [
        'income.basicIncome',
        'income.annualIncrementIncentive',
        'income.attendanceAllowance',
        'income.entertainAllowance',
        'income.transportAllowance',
        'income.functionalLeaderAllowance',
        'income.hardshipAllowance',
        'income.familyAllowance',
        'income.bpjsHealthAllowance',
        'income.salesAchievementBonus',
        'expense.currentMonthCashAdvance',
        'expense.remainingDebtLastMonth',
        'expense.stockOpnameInventory'
      ];

      const requiredGroupFields = [
        'expense.notComingToWork.amount',
        'expense.notComingToWork.unitNominal',
        'expense.notWearingWorkAttributes.amount',
        'expense.notWearingWorkAttributes.unitNominal',
        'expense.late.amount',
        'expense.late.unitNominal'
      ];

      [...requiredSimpleFields, ...requiredGroupFields].forEach((path) => {
        const value = getNestedValue(formValues, path.split('.'));
        if (!value || value === '') {
          err[path] = 'Field is required';
        }
      });

      setErrors(err);
      return { isValid: Object.keys(err).length === 0, errors: err };
    }
  }));

  useEffect(() => {
    const groupPaths = ['expense.notComingToWork', 'expense.notWearingWorkAttributes', 'expense.late'];

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
    formValues.expense?.notComingToWork?.amount,
    formValues.expense?.notComingToWork?.unitNominal,
    formValues.expense?.notWearingWorkAttributes?.amount,
    formValues.expense?.notWearingWorkAttributes?.unitNominal,
    formValues.expense?.late?.amount,
    formValues.expense?.late?.unitNominal
  ]);

  const getNestedValue = (obj, path) => path.reduce((acc, key) => acc?.[key], obj) || 0;

  const getTotalIncome = (formValues) => {
    const groupInputs = [];

    const simpleInputs = [
      'income.basicIncome',
      'income.annualIncrementIncentive',
      'income.attendanceAllowance',
      'income.entertainAllowance',
      'income.transportAllowance',
      'income.functionalLeaderAllowance',
      'income.hardshipAllowance',
      'income.familyAllowance',
      'income.bpjsHealthAllowance',
      'income.salesAchievementBonus'
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
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
        />

        {/* Tunjangan Entertain */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="entertainAllowance"
          name="entertainAllowance"
          idMessage="entertain-allowance"
          accessor="income.entertainAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        {/* Tunjangan Transportasi */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="transportAllowance"
          name="transportAllowance"
          idMessage="transport-allowance"
          accessor="income.transportAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        {/* Tunjangan Fungsional Leader */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="functionalLeaderAllowance"
          name="functionalLeaderAllowance"
          idMessage="functional-leader-allowance"
          accessor="income.functionalLeaderAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        {/* Tunjangan Hardship */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="hardshipAllowance"
          name="hardshipAllowance"
          idMessage="hardship-allowance"
          accessor="income.hardshipAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        {/* Tunjangan Keluarga */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="familyAllowance"
          name="familyAllowance"
          idMessage="family-allowance"
          accessor="income.familyAllowance"
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
        />

        {/* Bonus Pencapaian Omset */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="salesAchievementBonus"
          name="salesAchievementBonus"
          idMessage="sales-achievement-bonus"
          accessor="income.salesAchievementBonus"
          errors={errors}
          setErrors={setErrors}
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
          groupTitleIdMessage="absent-from-work"
          accessor="expense.notComingToWork"
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
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
          errors={errors}
          setErrors={setErrors}
        />

        {/* Stock Opname barang Inventory (office) */}
        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="stockOpnameInventory"
          name="stockOpnameInventory"
          idMessage="stock-opname-inventory-product"
          accessor="expense.stockOpnameInventory"
          errors={errors}
          setErrors={setErrors}
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
});

ManagerForm.propTypes = {
  formValues: PropTypes.object,
  setFormValues: PropTypes.func,
  isDetailForm: PropTypes.bool
};

export default ManagerForm;
