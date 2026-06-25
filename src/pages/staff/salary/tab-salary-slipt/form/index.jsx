import { PlusOutlined } from '@ant-design/icons';
import { Autocomplete, Button, Grid, InputLabel, TextField } from '@mui/material';
import { Stack } from '@mui/system';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { createMessageBackend, getLocationList, getStaffByLocationAndJobTitleList, getStaffJobTitleList } from 'service/service-global';
import {
  createCashierSalarySlipt,
  createDoctorSalarySlipt,
  createManagerSalarySlipt,
  createNurseGroomerSalarySlipt,
  createNurseHelperSalarySlipt,
  createParamedicSalarySlipt,
  createQualityControlSalarySlipt,
  createStaffSalarySlipt,
  getDetailSallarySlipt,
  staffSalaryCheck,
  updateSalarySlipt
} from '../../service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useNavigate, useParams } from 'react-router';

import CashierForm from './cashier-form';
import DoctorForm from './doctor-form';
import NurseGroomerForm from './nurse-groomer-form';
import ManagerForm from './manager-form';
import NurseHelperForm from './nurse-helper-form';
import ParamedicForm from './paramedic-form';
import QualityControlForm from './quality-control-form';
import StaffForm from './staff-form';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';

const INITIAL_FORM_VALUES = {
  startDate: null,
  endDate: null,
  location: null,
  jobTitle: null,
  name: null,
  income: {},
  expense: {}
};

const INITIAL_DROPDOWN_DATA = {
  locationList: [],
  jobTitleList: [],
  userList: []
};

export default function SallarySliptForm({ isDetailForm = false }) {
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [dropdownData, setDropdownData] = useState(INITIAL_DROPDOWN_DATA);
  const [userInformation, setUserInformation] = useState(null);
  const [jobName, setJobName] = useState(null);
  const params = useParams();
  const [isEditForm, setIsEditForm] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const formRef = useRef(null);

  useEffect(() => {
    if (params.id) {
      setIsEditForm(true);
      const getDetail = async (id) => {
        const getResp = await getDetailSallarySlipt({
          id
        });

        const {
          data: { data }
        } = getResp;

        const mappedDataToFormValues = {
          ...data,
          startDate: dayjs(data.startDate),
          endDate: dayjs(data.endDate),
          location: {
            value: data.locationId,
            label: data.locationName
          },
          jobTitle: {
            value: data.jobTitleId,
            label: data.jobTitleName
          },
          name: {
            value: data.staffId,
            label: data.name
          },
          income: {
            ...data.income,
            labXrayIncentive: {
              amount: data.income.labXrayIncentive?.amount ?? 0,
              unitNominal: data.income.labXrayIncentive?.unitNominal ?? 0,
              total: data.income.labXrayIncentive?.total ?? 0
            }
          },
          expense: {
            ...data.expense,
            currentMonthCashAdvance: Number(data.expense.currentMonthCashAdvance),
            absent: {
              amount: data.expense.absent?.amount ?? 0,
              unitNominal: data.expense.absent?.unitNominal ?? 0,
              total: data.expense.absent?.total ?? 0
            },
            notWearingAttribute: {
              amount: data.expense.notWearingAttribute?.amount ?? 0,
              unitNominal: data.expense.notWearingAttribute?.unitNominal ?? 0,
              total: data.expense.notWearingAttribute?.total ?? 0
            }
          },
          bonus: data.bonus || {}
        };

        setFormValues(mappedDataToFormValues);
      };

      getDetail(params.id);
    }
  }, [params.id]);

  const getDropdownData = async () => {
    const [locationResp, jobTitleResp] = await Promise.all([getLocationList(), getStaffJobTitleList()]);

    setDropdownData((prev) => ({
      ...prev,
      jobTitleList: jobTitleResp,
      locationList: locationResp
    }));
  };

  const getStaffNameDropdownData = async () => {
    const userResp = await getStaffByLocationAndJobTitleList({
      locationId: formValues.location.value,
      jobTitleId: formValues.jobTitle.value
    });

    setDropdownData((prev) => ({
      ...prev,
      userList: userResp
    }));
  };

  const getSalaryCheck = async (staffId) => {
    const salaryCheckResponse = await staffSalaryCheck({
      staffId,
      dateFrom: formValues.startDate.format('YYYY-MM-DD'),
      dateTo: formValues.endDate.format('YYYY-MM-DD')
    });

    setJobName(salaryCheckResponse.data.user.jobName);

    const salaryData = salaryCheckResponse.data.sallary;

    setUserInformation(salaryCheckResponse.data.user);

    if (!isEditForm) {
      setFormValues((prev) => ({
        ...prev,
        income: {
          basicIncome: salaryData.basicIncome,
          attendanceAllowance: salaryData.attendanceAllowance,
          mealAllowance: salaryData.mealAllowance,
          housingAllowance: salaryData.housingAllowance ?? 0,
          clinicTurnoverBonus: salaryData.clinicRevenueBonus ?? 0,
          bpjsHealthAllowance: salaryData.bpjsHealthAllowance ?? 0,
          patientIncentive: {
            amount: salaryData.quantityPatientIncentive ?? 0,
            unitNominal: salaryData.eachPatientIncentive ?? 10000,
            total: salaryData.patientIncentive ?? 0
          },
          labXrayIncentive: {
            amount: salaryData.quantityXray ?? 0,
            unitNominal: salaryData.eachXray ?? 5000,
            total: salaryData.labXrayIncentive ?? 0
          },
          longShiftReplacement: {
            amount: salaryData.quantityLongShiftSubstituteWage ?? 0,
            unitNominal: salaryData.eachLongShiftSubstituteWage ?? 0,
            total: salaryData.totalLongShiftSubstituteWage ?? 0
          },
          fullShiftReplacement: {
            amount: salaryData.quantityFullShiftSubstituteWage ?? 0,
            unitNominal: salaryData.eachFullShiftSubstituteWage ?? 0,
            total: salaryData.totalFullShiftSubstituteWage ?? 0
          }
        },
        expense: {
          absent: {
            amount: salaryData.notComingToWork ?? 0,
            unitNominal: salaryData.eachNotComingToWork ?? 50000,
            total: salaryData.notComingToWorkTotal ?? 0
          },
          late: {
            amount: salaryData.quantityLate ?? 0,
            unitNominal: salaryData.eachLate ?? 0,
            total: salaryData.late ?? 0
          },
          notWearingAttribute: { amount: 0, unitNominal: 0, total: 0 },
          currentMonthCashAdvance: 0,
          remainingDebtLastMonth: 0,
          stockOpnameInventory: 0,
          stockOpnameLost: 0,
          stockOpnameExpired: 0
        },
        bonus: {
          isProbationPassed: false,
          totalOmset: 0,
          totalPatients: 0,
          calendarDays: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
          totalLeaveDays: 0,
          docComplete: false,
          spCutPercentage: 0
        }
      }));
    }
  };

  useEffect(() => {
    if (!formValues?.name) return;

    getSalaryCheck(formValues.name.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.name]);

  useEffect(() => {
    if (formValues.location && formValues.jobTitle) {
      getStaffNameDropdownData();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValues.location, formValues.jobTitle]);

  useEffect(() => {
    getDropdownData();
  }, []);

  const renderDynamicForm = (jobName) => {
    if (!jobName) return null;

    const jobNameLowercase = jobName.toLowerCase();

    if (jobNameLowercase.includes('kasir')) {
      return <CashierForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('paramedis')) {
      return <ParamedicForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('helper')) {
      return <NurseHelperForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('groomer')) {
      return <NurseGroomerForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('dokter hewan')) {
      return (
        <DoctorForm
          ref={formRef}
          formValues={formValues}
          setFormValues={setFormValues}
          isDetailForm={isDetailForm}
          joinDate={userInformation?.joinDate}
        />
      );
    } else if (jobNameLowercase.includes('quality control & trainer')) {
      return <QualityControlForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('manager')) {
      return <ManagerForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else if (jobNameLowercase.includes('staff')) {
      return <StaffForm ref={formRef} formValues={formValues} setFormValues={setFormValues} isDetailForm={isDetailForm} />;
    } else {
      return <div>{jobName} is not found</div>;
    }
  };

  const onSubmit = async (jobName) => {
    const validationResult = formRef.current?.validateForm?.();

    if (validationResult && !validationResult.isValid) {
      // bisa set error ke state & tampilkan di UI kalau mau
      dispatch(snackbarError('Please fill in the required fields'));
      return;
    }

    if (!isEditForm) {
      try {
        const requestBody = {
          staffId: formValues.name.value,
          name: formValues.name.label,
          locationId: formValues.location.value,
          payrollDate: formValues.startDate.format('YYYY-MM-DD'),
          startDate: formValues.startDate.format('YYYY-MM-DD'),
          endDate: formValues.endDate.format('YYYY-MM-DD'),
          income: formValues.income,
          expense: formValues.expense,
          bonus: formValues.bonus
        };

        const jobNameLowercase = jobName.toLowerCase();

        if (jobNameLowercase.includes('kasir')) {
          await createCashierSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('paramedis')) {
          await createParamedicSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('helper')) {
          await createNurseHelperSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('groomer')) {
          await createNurseGroomerSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('dokter hewan')) {
          await createDoctorSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('quality control & trainer')) {
          await createQualityControlSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('manager')) {
          await createManagerSalarySlipt(requestBody);
        } else if (jobNameLowercase.includes('staff')) {
          await createStaffSalarySlipt(requestBody);
        } else {
          dispatch(snackbarError('Unknown job name'));
        }

        dispatch(snackbarSuccess('Success Create Salary Slipt'));
        navigate('/staff/salary', { replace: true });
      } catch (error) {
        dispatch(snackbarError(createMessageBackend(error)));
      }
    } else {
      try {
        const removeEmptyObjects = (obj) => {
          if (typeof obj !== 'object' || obj === null) return obj;

          const cleaned = Object.entries(obj)
            .map(([key, value]) => [key, removeEmptyObjects(value)]) // rekursif ke dalam
            // eslint-disable-next-line no-unused-vars
            .filter(([_, value]) => {
              if (typeof value === 'object' && value !== null) {
                return Object.keys(value).length > 0; // hanya simpan jika bukan objek kosong
              }
              return value !== undefined && value !== null && value !== '';
            });

          return Object.fromEntries(cleaned);
        };

        const requestBody = {
          staffId: formValues.name.value,
          name: formValues.name.label,
          locationId: formValues.location.value,
          payrollDate: formValues.startDate.format('YYYY-MM-DD'),
          startDate: formValues.startDate.format('YYYY-MM-DD'),
          endDate: formValues.endDate.format('YYYY-MM-DD'),
          income: removeEmptyObjects(formValues.income),
          expense: removeEmptyObjects(formValues.expense)
        };

        await updateSalarySlipt(params.id, requestBody);

        dispatch(snackbarSuccess('Success Update Salary Slipt'));
        navigate('/staff/salary', { replace: true });
      } catch (error) {
        dispatch(snackbarError(createMessageBackend(error)));
      }
    }
  };
  const onBack = () => {
    navigate('/staff/salary', { replace: true });
  };
  const clearForm = () => {
    setFormValues(INITIAL_FORM_VALUES);
    setUserInformation(null);
    setJobName(null);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(jobName);
        }}
      >
        {/* <pre>{JSON.stringify(formValues, null, 2)}</pre> */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <HeaderPageCustom
            title={
              isDetailForm ? (
                <FormattedMessage id="detail-payroll" />
              ) : isEditForm ? (
                <FormattedMessage id="edit-payroll" />
              ) : (
                <FormattedMessage id="create-payroll" />
              )
            }
            locationBackConfig={{
              setLocationBack: true,
              customUrl: '/staff/salary'
            }}
            action={
              <>
                {!isDetailForm && (
                  <Button variant="contained" className="button__primary button__submit" startIcon={<PlusOutlined />}>
                    {<FormattedMessage id="save" />}
                  </Button>
                )}
              </>
            }
          />
          <MainCard border={false} boxShadow>
            <Grid container spacing={3} mb={5}>
              {/* Start Date */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="startDate">{<FormattedMessage id="start-date" />}</InputLabel>
                  <DatePicker
                    readOnly={isDetailForm}
                    minDate={dayjs('2020-01-01')}
                    value={formValues.startDate}
                    onChange={(newValue) => {
                      setFormValues((prev) => ({
                        ...prev,
                        startDate: newValue
                      }));
                    }}
                    renderInput={(params) => <TextField id="startDate" name="startDate" {...params} />}
                  />
                </Stack>
              </Grid>

              {/* End Date */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="endDate">{<FormattedMessage id="end-date" />}</InputLabel>
                  <DatePicker
                    readOnly={isDetailForm}
                    minDate={dayjs('2020-01-01')}
                    value={formValues.endDate}
                    onChange={(newValue) => {
                      setFormValues((prev) => ({
                        ...prev,
                        endDate: newValue
                      }));
                    }}
                    renderInput={(params) => <TextField id="endDate" name="endDate" {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Location / Branch */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="location">
                    <FormattedMessage id="location" />
                  </InputLabel>
                  <Autocomplete
                    id="location"
                    readOnly={isDetailForm}
                    options={dropdownData.locationList}
                    value={formValues.location}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, selected) => {
                      const locationValue = selected ? selected : null;
                      setFormValues((e) => ({ ...e, location: locationValue }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Job TItle */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="jobTitle">
                    <FormattedMessage id="job-title" />
                  </InputLabel>
                  <Autocomplete
                    id="jobTitle"
                    readOnly={isDetailForm}
                    options={dropdownData.jobTitleList}
                    value={formValues.jobTitle}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, selected) => {
                      const jobTitleValue = selected ? selected : null;
                      setFormValues((e) => ({ ...e, jobTitle: jobTitleValue }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {/* Name */}
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="name">
                    <FormattedMessage id="name" />
                  </InputLabel>
                  <Autocomplete
                    id="name"
                    readOnly={isDetailForm}
                    options={dropdownData.userList}
                    value={formValues.name}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, selected) => {
                      const nameValue = selected ? selected : null;
                      setFormValues((e) => ({ ...e, name: nameValue }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>

              {userInformation && (
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="partner-id" />
                        </InputLabel>
                        {userInformation?.registrationNo || '-'}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="job-name" />
                        </InputLabel>
                        {userInformation?.jobName || '-'}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="status" />
                        </InputLabel>
                        {userInformation?.status || '-'}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="work-start-date" />
                        </InputLabel>
                        {userInformation?.startDate || '-'}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Stack spacing={1}>
                        <InputLabel>
                          <FormattedMessage id="work-end-date" />
                        </InputLabel>
                        {userInformation?.endDate || '-'}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              )}
            </Grid>

            {renderDynamicForm(jobName)}

            <Grid item xs={12} sx={{ marginTop: 5 }}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                {!isDetailForm && (
                  <Button variant="outlined" onClick={clearForm}>
                    {<FormattedMessage id="clear" />}
                  </Button>
                )}

                <Button variant="contained" className="button__submit" color="error" type="button" onClick={onBack}>
                  {<FormattedMessage id="back" />}
                </Button>

                {!isDetailForm && (
                  <Button variant="contained" type="submit" className="button__primary button__submit">
                    {<FormattedMessage id="save" />}
                  </Button>
                )}
              </Stack>
            </Grid>
          </MainCard>
        </LocalizationProvider>
      </form>
    </div>
  );
}
