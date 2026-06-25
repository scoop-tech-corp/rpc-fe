import {
  Box,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';
import GroupInput from '../components/GroupInput';
import SimpleInput from '../components/SimpleInput';
import dayjs from 'dayjs';

// ── Tabel bonus berdasarkan tagihan rata-rata per pasien ──────────────────────
const BONUS_RANGES = [
  { min: 100000, max: 150999 },
  { min: 151000, max: 200999 },
  { min: 201000, max: 250999 },
  { min: 251000, max: 300999 },
  { min: 301000, max: 350999 },
  { min: 351000, max: 400999 },
  { min: 401000, max: 450999 },
  { min: 451000, max: 499999 },
  { min: 500000, max: Infinity }
];

const TABLE1 = [1.6, 2.2, 3.6, 3.8, 4.0, 4.2, 4.4, 4.6, 5.0]; // bergabung ≤ 30 Des 2021
const TABLE2 = [1.4, 1.6, 2.2, 3.6, 3.8, 4.0, 4.2, 4.4, 4.6]; // 1 Jan 2022 – 14 Nov 2023
const TABLE3 = [1.4, 1.6, 2.0, 3.4, 3.6, 3.8, 4.0, 4.2, 4.4]; // ≥ 15 Nov 2023

function getBonusPct(joinDate, avgBill) {
  if (!joinDate || !avgBill || avgBill <= 0) return 0;
  const jd = dayjs(joinDate);
  const pcts =
    jd.isBefore('2021-12-31', 'day') || jd.isSame('2021-12-30', 'day') ? TABLE1 : !jd.isAfter('2023-11-14', 'day') ? TABLE2 : TABLE3;
  const idx = BONUS_RANGES.findIndex(({ min, max }) => avgBill >= min && avgBill <= max);
  return idx >= 0 ? pcts[idx] : 0;
}

function getBonusTableLabel(joinDate) {
  if (!joinDate) return '';
  const jd = dayjs(joinDate);
  if (jd.isBefore('2021-12-31', 'day') || jd.isSame('2021-12-30', 'day')) return 'Tabel 1 (bergabung ≤ 30 Des 2021)';
  if (!jd.isAfter('2023-11-14', 'day')) return 'Tabel 2 (1 Jan 2022 – 14 Nov 2023)';
  return 'Tabel 3 (≥ 15 Nov 2023)';
}

function calcLateUnitNominal(days) {
  if (days <= 0) return 0;
  if (days <= 2) return 5000;
  if (days <= 5) return 10000;
  return 20000;
}

// ─────────────────────────────────────────────────────────────────────────────

const DoctorForm = forwardRef(({ formValues, setFormValues, isDetailForm = false, joinDate }, ref) => {
  const [errors, setErrors] = useState({});

  const getVal = (path) => path.split('.').reduce((o, k) => o?.[k], formValues) ?? 0;

  useImperativeHandle(ref, () => ({
    validateForm: () => {
      const err = {};
      const simpleRequired = [
        'income.basicIncome',
        'income.attendanceAllowance',
        'income.mealAllowance',
        'income.clinicTurnoverBonus',
        'income.housingAllowance',
        'income.bpjsHealthAllowance',
        'expense.currentMonthCashAdvance',
        'expense.remainingDebtLastMonth',
        'expense.stockOpnameInventory',
        'expense.stockOpnameLost',
        'expense.stockOpnameExpired'
      ];
      const groupRequired = [
        'income.patientIncentive.amount',
        'income.patientIncentive.unitNominal',
        'income.labXrayIncentive.amount',
        'income.labXrayIncentive.unitNominal',
        'income.longShiftReplacement.amount',
        'income.longShiftReplacement.unitNominal',
        'income.fullShiftReplacement.amount',
        'income.fullShiftReplacement.unitNominal',
        'expense.absent.amount',
        'expense.absent.unitNominal',
        'expense.notWearingAttribute.amount',
        'expense.notWearingAttribute.unitNominal'
      ];
      [...simpleRequired, ...groupRequired].forEach((path) => {
        const v = getVal(path);
        if (v === undefined || v === null || v === '') err[path] = 'Field is required';
      });
      setErrors(err);
      return { isValid: Object.keys(err).length === 0, errors: err };
    }
  }));

  // Auto-calculate GroupInput totals
  useEffect(() => {
    const groups = [
      ['income', 'patientIncentive'],
      ['income', 'labXrayIncentive'],
      ['income', 'longShiftReplacement'],
      ['income', 'fullShiftReplacement'],
      ['expense', 'absent'],
      ['expense', 'notWearingAttribute']
    ];
    let upd = { ...formValues };
    groups.forEach(([sec, field]) => {
      const g = upd[sec]?.[field] ?? {};
      const total = Number(g.amount || 0) * Number(g.unitNominal || 0);
      upd = { ...upd, [sec]: { ...upd[sec], [field]: { ...g, total } } };
    });
    setFormValues(upd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues.income?.patientIncentive?.amount,
    formValues.income?.patientIncentive?.unitNominal,
    formValues.income?.labXrayIncentive?.amount,
    formValues.income?.labXrayIncentive?.unitNominal,
    formValues.income?.longShiftReplacement?.amount,
    formValues.income?.longShiftReplacement?.unitNominal,
    formValues.income?.fullShiftReplacement?.amount,
    formValues.income?.fullShiftReplacement?.unitNominal,
    formValues.expense?.absent?.amount,
    formValues.expense?.absent?.unitNominal,
    formValues.expense?.notWearingAttribute?.amount,
    formValues.expense?.notWearingAttribute?.unitNominal
  ]);

  // Auto-calculate late deduction (tiered)
  useEffect(() => {
    const days = Number(formValues.expense?.late?.amount || 0);
    const unitNominal = calcLateUnitNominal(days);
    setFormValues((prev) => ({
      ...prev,
      expense: { ...prev.expense, late: { amount: days, unitNominal, total: days * unitNominal } }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.expense?.late?.amount]);

  // Auto-calculate bonus
  useEffect(() => {
    const b = formValues.bonus || {};
    const isPassed = !!b.isProbationPassed;
    const omset = Number(b.totalOmset || 0);
    const patients = Number(b.totalPatients || 0);
    const leaveDays = Number(b.totalLeaveDays || 0);
    const calDays = Number(b.calendarDays || 30);
    const docOk = !!b.docComplete;
    const spCut = Number(b.spCutPercentage || 0);

    let avg = 0,
      pct = 0,
      gross = 0,
      excess = 0,
      prop = 0,
      mult = 1,
      final = 0;
    if (isPassed && omset > 0 && patients > 0) {
      avg = omset / patients;
      pct = getBonusPct(joinDate, avg);
      gross = omset * (pct / 100);
      excess = Math.max(0, leaveDays - 4);
      prop = calDays > 0 && excess > 0 ? gross - (excess / calDays) * gross : gross;
      mult = docOk ? 1 : 0.8;
      final = Math.round(prop * mult * (1 - spCut / 100));
    }
    setFormValues((prev) => ({
      ...prev,
      bonus: {
        ...prev.bonus,
        avgBillPerPatient: avg,
        percentage: pct,
        gross,
        excessLeaveDays: excess,
        proportional: prop,
        adminMultiplier: mult,
        final
      }
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formValues.bonus?.isProbationPassed,
    formValues.bonus?.totalOmset,
    formValues.bonus?.totalPatients,
    formValues.bonus?.totalLeaveDays,
    formValues.bonus?.calendarDays,
    formValues.bonus?.docComplete,
    formValues.bonus?.spCutPercentage,
    joinDate
  ]);

  const bonus = formValues.bonus || {};
  const setBonus = (key, value) => setFormValues((prev) => ({ ...prev, bonus: { ...prev.bonus, [key]: value } }));

  const lateDays = Number(formValues.expense?.late?.amount || 0);

  const lateLabel = useMemo(() => {
    if (lateDays <= 0) return null;
    if (lateDays <= 2) return `${lateDays} hari × Rp 5.000 = Rp ${formatThousandSeparator(lateDays * 5000)}`;
    if (lateDays <= 5) return `${lateDays} hari × Rp 10.000 = Rp ${formatThousandSeparator(lateDays * 10000)}`;
    return `${lateDays} hari × Rp 20.000 = Rp ${formatThousandSeparator(lateDays * 20000)}`;
  }, [lateDays]);

  const totalIncome =
    [
      'income.patientIncentive.total',
      'income.labXrayIncentive.total',
      'income.longShiftReplacement.total',
      'income.fullShiftReplacement.total',
      'income.basicIncome',
      'income.attendanceAllowance',
      'income.mealAllowance',
      'income.housingAllowance',
      'income.clinicTurnoverBonus',
      'income.bpjsHealthAllowance'
    ].reduce((s, p) => s + Number(getVal(p)), 0) + Number(bonus.final || 0);

  const totalExpense = [
    'expense.absent.total',
    'expense.notWearingAttribute.total',
    'expense.late.total',
    'expense.currentMonthCashAdvance',
    'expense.remainingDebtLastMonth',
    'expense.stockOpnameInventory',
    'expense.stockOpnameLost',
    'expense.stockOpnameExpired'
  ].reduce((s, p) => s + Number(getVal(p)), 0);

  return (
    <>
      {/* ── PEMASUKKAN ─────────────────────────────────────────────────────── */}
      <h3>Pemasukkan</h3>
      <Grid container spacing={3}>
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

        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="mealAllowance"
          name="mealAllowance"
          idMessage="meal-allowance"
          accessor="income.mealAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="housingAllowance"
          name="housingAllowance"
          idMessage="housing-allowance"
          accessor="income.housingAllowance"
          errors={errors}
          setErrors={setErrors}
        />

        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="patientIncentive"
          name="patientIncentive"
          groupTitleIdMessage="patient-incentive"
          accessor="income.patientIncentive"
          errors={errors}
          setErrors={setErrors}
        />

        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="labXrayIncentive"
          name="labXrayIncentive"
          groupTitleIdMessage="xray-incentive"
          accessor="income.labXrayIncentive"
          errors={errors}
          setErrors={setErrors}
        />

        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="clinicTurnoverBonus"
          name="clinicTurnoverBonus"
          idMessage="clinic-turnover-bonus"
          accessor="income.clinicTurnoverBonus"
          errors={errors}
          setErrors={setErrors}
        />

        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="longShiftReplacement"
          name="longShiftReplacement"
          groupTitleIdMessage="long-shift-substitute-wage"
          accessor="income.longShiftReplacement"
          errors={errors}
          setErrors={setErrors}
        />

        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="fullShiftReplacement"
          name="fullShiftReplacement"
          groupTitleIdMessage="full-shift-substitute-wage"
          accessor="income.fullShiftReplacement"
          errors={errors}
          setErrors={setErrors}
        />

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

        <Grid item xs={12}>
          <Box textAlign="end" fontSize={16}>
            <FormattedMessage id="total-income" />: Rp {formatThousandSeparator(totalIncome)}
          </Box>
        </Grid>
      </Grid>

      {/* ── BONUS OMSET ────────────────────────────────────────────────────── */}
      <h3>Bonus Omset</h3>
      <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <InputLabel sx={{ minWidth: 120 }}>Status Probation</InputLabel>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <Select
                  value={bonus.isProbationPassed ? '1' : '0'}
                  onChange={(e) => setBonus('isProbationPassed', e.target.value === '1')}
                  disabled={isDetailForm}
                >
                  <MenuItem value="0">Masa Probation</MenuItem>
                  <MenuItem value="1">Sudah Lulus Probation</MenuItem>
                </Select>
              </FormControl>
              {!bonus.isProbationPassed && <Chip label="Bonus tidak dihitung" color="warning" size="small" />}
            </Stack>
          </Grid>

          {bonus.isProbationPassed && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Total Omset Bulan (Rp)</InputLabel>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={bonus.totalOmset || ''}
                    onChange={(e) => setBonus('totalOmset', Number(e.target.value))}
                    inputProps={{ readOnly: isDetailForm, min: 0 }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Total Pasien Bulan</InputLabel>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={bonus.totalPatients || ''}
                    onChange={(e) => setBonus('totalPatients', Number(e.target.value))}
                    inputProps={{ readOnly: isDetailForm, min: 0 }}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Hari Kalender Bulan</InputLabel>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={bonus.calendarDays || ''}
                    onChange={(e) => setBonus('calendarDays', Number(e.target.value))}
                    inputProps={{ readOnly: isDetailForm, min: 28, max: 31 }}
                  />
                  <FormHelperText>Jumlah hari di bulan ini (28/29/30/31)</FormHelperText>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Total Hari Libur</InputLabel>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={bonus.totalLeaveDays || ''}
                    onChange={(e) => setBonus('totalLeaveDays', Number(e.target.value))}
                    inputProps={{ readOnly: isDetailForm, min: 0 }}
                  />
                  <FormHelperText>Hak libur = 4 hari Minggu/bulan</FormHelperText>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Kelengkapan Dokumen</InputLabel>
                  <FormControl size="small">
                    <Select
                      value={bonus.docComplete ? '1' : '0'}
                      onChange={(e) => setBonus('docComplete', e.target.value === '1')}
                      disabled={isDetailForm}
                    >
                      <MenuItem value="1">Lengkap (100%)</MenuItem>
                      <MenuItem value="0">Belum Lengkap (80%)</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack spacing={1}>
                  <InputLabel>Potongan SP (%)</InputLabel>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={bonus.spCutPercentage || ''}
                    onChange={(e) => setBonus('spCutPercentage', Number(e.target.value))}
                    inputProps={{ readOnly: isDetailForm, min: 0, max: 100 }}
                  />
                  <FormHelperText>Isi 0 jika tidak kena SP</FormHelperText>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Divider />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" mb={1} color="text.secondary">
                    Hasil Perhitungan Bonus
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      {
                        label: 'Tagihan Rata-rata / Pasien',
                        value: `Rp ${formatThousandSeparator(Math.round(bonus.avgBillPerPatient || 0))}`
                      },
                      { label: 'Persentase Bonus', value: `${bonus.percentage || 0}%`, primary: true },
                      { label: 'Bonus Kasar (omset × %)', value: `Rp ${formatThousandSeparator(Math.round(bonus.gross || 0))}` },
                      { label: 'Hari Libur Berlebih', value: `${bonus.excessLeaveDays || 0} hari` },
                      { label: 'Setelah Koreksi Kehadiran', value: `Rp ${formatThousandSeparator(Math.round(bonus.proportional || 0))}` },
                      { label: 'Multiplier Dokumen', value: `${((bonus.adminMultiplier || 1) * 100).toFixed(0)}%` }
                    ].map(({ label, value, primary }) => (
                      <Grid item xs={12} sm={6} key={label}>
                        <Stack direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body2" fontWeight={primary ? 700 : 400} color={primary ? 'primary.main' : 'text.primary'}>
                            {value}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Bonus Final
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700} color="success.main">
                      Rp {formatThousandSeparator(Math.round(bonus.final || 0))}
                    </Typography>
                  </Stack>
                  {joinDate && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      {getBonusTableLabel(joinDate)}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Box>

      {/* ── PENGELUARAN ────────────────────────────────────────────────────── */}
      <h3>Pengeluaran</h3>
      <Grid container spacing={3}>
        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="absent"
          name="absent"
          groupTitleIdMessage="absent-from-work"
          accessor="expense.absent"
          errors={errors}
          setErrors={setErrors}
        />

        <GroupInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="notWearingAttribute"
          name="notWearingAttribute"
          groupTitleIdMessage="not-wearing-work-attributes"
          accessor="expense.notWearingAttribute"
          errors={errors}
          setErrors={setErrors}
        />

        {/* Keterlambatan — input jumlah hari, nominal dihitung otomatis (tiered) */}
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel>Keterlambatan (hari)</InputLabel>
            <TextField
              type="number"
              size="small"
              sx={{ maxWidth: 180 }}
              value={formValues.expense?.late?.amount ?? ''}
              onChange={(e) =>
                setFormValues((prev) => ({
                  ...prev,
                  expense: { ...prev.expense, late: { ...prev.expense?.late, amount: Number(e.target.value) } }
                }))
              }
              inputProps={{ readOnly: isDetailForm, min: 0 }}
            />
            {lateLabel && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'warning.lighter',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1
                }}
              >
                <Typography variant="body2">{lateLabel}</Typography>
                {lateDays <= 2 && <Chip label="Tier 1 (1-2 hari)" size="small" color="success" />}
                {lateDays > 2 && lateDays <= 5 && <Chip label="Tier 2 (3-5 hari)" size="small" color="warning" />}
                {lateDays > 5 && <Chip label="Tier 3 (>5 hari)" size="small" color="error" />}
              </Box>
            )}
          </Stack>
        </Grid>

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

        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="stockOpnameLost"
          name="stockOpnameLost"
          idMessage="stock-opname-lost-product"
          accessor="expense.stockOpnameLost"
          errors={errors}
          setErrors={setErrors}
        />

        <SimpleInput
          readOnly={isDetailForm}
          formValues={formValues}
          setFormValues={setFormValues}
          id="stockOpnameExpired"
          name="stockOpnameExpired"
          idMessage="stock-opname-expired-product"
          accessor="expense.stockOpnameExpired"
          errors={errors}
          setErrors={setErrors}
        />

        <Grid item xs={12}>
          <Box textAlign="end" fontSize={16}>
            <FormattedMessage id="total-expense" />: Rp {formatThousandSeparator(totalExpense)}
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Stack textAlign="end" fontSize={16}>
            <h4 style={{ margin: 0 }}>
              <FormattedMessage id="net-income" />
            </h4>
            <div>Rp {formatThousandSeparator(totalIncome - totalExpense)}</div>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
});

DoctorForm.displayName = 'DoctorForm';

DoctorForm.propTypes = {
  formValues: PropTypes.object,
  setFormValues: PropTypes.func,
  isDetailForm: PropTypes.bool,
  joinDate: PropTypes.string
};

export default DoctorForm;
