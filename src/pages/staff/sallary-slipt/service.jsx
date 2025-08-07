import { formateDateYYYMMDD } from 'utils/func';
import axios from 'utils/axios';

export const getSallarySliptList = async (property) => {
  const dateFrom = property?.dateRange ? formateDateYYYMMDD(property.dateRange[0]) : '';
  const dateTo = property?.dateRange ? formateDateYYYMMDD(property.dateRange[1]) : '';

  const getResp = await axios.get('staff/salary-slip', {
    params: {
      rowPerPage: property.rowPerPage,
      goToPage: property.goToPage,
      orderValue: property.orderValue,
      orderColumn: property.orderColumn,
      search: property.keyword,
      locationId: property.locationId,
      startDate: dateFrom,
      endDate: dateTo
    }
  });

  return getResp;
};

export const getDetailSallarySlipt = async (params) => {
  const getResp = await axios.get('staff/salary-slip/detail', {
    params: {
      id: params.id
    }
  });

  return getResp;
};

export const generateSallarySlipt = async (params) => {
  const getResp = await axios.get('staff/salary-slip/generate-slip', {
    responseType: 'blob',
    params: {
      id: params.id
    }
  });

  return getResp;
};

export const updateSalarySlipt = async (id, params) => {
  const getResp = await axios.put('staff/salary-slip', {
    id,
    ...params
  });

  return getResp;
};

export const deleteSallarySliptList = async (id) => {
  return await axios.delete('staff/salary-slip', {
    data: { id }
  });
};

export const exportSallarySlipt = async (params) => {
  const dateFrom = params?.dateRange ? formateDateYYYMMDD(params.dateRange[0]) : '';
  const dateTo = params?.dateRange ? formateDateYYYMMDD(params.dateRange[1]) : '';

  return await axios.get('staff/salary-slip/export', {
    responseType: 'blob',
    params: {
      orderValue: params.orderValue,
      orderColumn: params.orderColumn,
      locationId: params.locationId.length ? params.locationId : [''],
      dateFrom: dateFrom,
      dateTo: dateTo
    }
  });
};

export const staffSalaryCheck = async (params) => {
  const staffId = params.staffId;
  const dateFrom = params.dateFrom;
  const dateTo = params.dateTo;

  return await axios.get('staff/salary/check', {
    params: {
      staffId,
      dateFrom,
      dateTo
    }
  });
};

export const createSalarySlipt = async (params) => {
  return await axios.post('staff/salary-slip', params);
};

export const createNurseHelperSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      mealAllowance: params.income.mealAllowance,
      positionalAllowance: params.income.positionalAllowance,
      labXrayIncentive: {
        amount: params.income.xrayIncentive.amount,
        unitNominal: params.income.xrayIncentive.unitNominal,
        total: params.income.xrayIncentive.total
      },
      groomingIncentive: {
        amount: params.income.groomingIncentive.amount,
        unitNominal: params.income.groomingIncentive.unitNominal,
        total: params.income.groomingIncentive.total
      },
      clinicTurnoverBonus: params.income.clinicTurnoverBonus,
      replacementDays: {
        amount: params.income.replacementWagesForDays.amount,
        unitNominal: params.income.replacementWagesForDays.unitNominal,
        total: params.income.replacementWagesForDays.total
      },
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createCashierSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      mealAllowance: params.income.mealAllowance,
      positionalAllowance: params.income.positionalAllowance,
      housingAllowance: params.income.housingAllowance,
      petshopTurnoverIncentive: params.income.petshopTurnoverIncentive,
      salesAchievementBonus: params.income.salesAchievementBonus,
      memberAchievementBonus: params.income.memberAchievementBonus,
      replacementDays: {
        amount: params.income.replacementWagesForDays.amount,
        unitNominal: params.income.replacementWagesForDays.unitNominal,
        total: params.income.replacementWagesForDays.total
      },
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory,
      lostInventory: params.expense.lostInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createParamedicSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      mealAllowance: params.income.mealAllowance,
      housingAllowance: params.income.housingAllowance,
      clinicTurnoverBonus: params.income.clinicTurnoverBonus,
      labXrayIncentive: {
        amount: params.income.xrayIncentive.amount,
        unitNominal: params.income.xrayIncentive.unitNominal,
        total: params.income.xrayIncentive.total
      },
      longShiftReplacement: {
        amount: params.income.longShiftReplacement.amount,
        unitNominal: params.income.longShiftReplacement.unitNominal,
        total: params.income.longShiftReplacement.total
      },
      fullShiftReplacement: {
        amount: params.income.fullShiftReplacement.amount,
        unitNominal: params.income.fullShiftReplacement.unitNominal,
        total: params.income.fullShiftReplacement.total
      },
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createDoctorSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      attendanceAllowance: params.income.attendanceAllowance,
      mealAllowance: params.income.mealAllowance,
      housingAllowance: params.income.housingAllowance,
      clinicTurnoverBonus: params.income.clinicTurnoverBonus,
      patientIncentive: {
        amount: params.income.patientIncentive.amount,
        unitNominal: params.income.patientIncentive.unitNominal,
        total: params.income.patientIncentive.total
      },
      labXrayIncentive: {
        amount: params.income.xrayIncentive.amount,
        unitNominal: params.income.xrayIncentive.unitNominal,
        total: params.income.xrayIncentive.total
      },
      longShiftReplacement: {
        amount: params.income.longShiftReplacement.amount,
        unitNominal: params.income.longShiftReplacement.unitNominal,
        total: params.income.longShiftReplacement.total
      },
      fullShiftReplacement: {
        amount: params.income.fullShiftReplacement.amount,
        unitNominal: params.income.fullShiftReplacement.unitNominal,
        total: params.income.fullShiftReplacement.total
      },
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory,
      stockOpnameLost: params.expense.stockOpnameLost,
      stockOpnameExpired: params.expense.stockOpnameExpired
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createQualityControlSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      entertainAllowance: params.income.entertainAllowance,
      transportAllowance: params.income.transportAllowance,
      positionalAllowance: params.income.positionalAllowance,
      housingAllowance: params.income.housingAllowance,
      turnoverAchievementBonus: params.income.turnoverAchievementBonus,
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createManagerSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      entertainAllowance: params.income.entertainAllowance,
      transportAllowance: params.income.transportAllowance,
      functionalLeaderAllowance: params.income.functionalLeaderAllowance,
      hardshipAllowance: params.income.hardshipAllowance,
      familyAllowance: params.income.familyAllowance,
      bpjsHealthAllowance: params.income.bpjsHealthAllowance,
      clinicTurnoverBonus: params.income.clinicTurnoverBonus
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createNurseGroomerSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      mealAllowance: params.income.mealAllowance,
      positionalAllowance: params.income.positionalAllowance,
      labXrayIncentive: {
        amount: params.income.xrayIncentive.amount,
        unitNominal: params.income.xrayIncentive.unitNominal,
        total: params.income.xrayIncentive.total
      },
      groomingIncentive: {
        amount: params.income.groomingIncentive.amount,
        unitNominal: params.income.groomingIncentive.unitNominal,
        total: params.income.groomingIncentive.total
      },
      clinicTurnoverBonus: params.income.clinicTurnoverBonus,
      patientIncentive: {
        amount: params.income.patientIncentive.amount,
        unitNominal: params.income.patientIncentive.unitNominal,
        total: params.income.patientIncentive.total
      },
      replacementDays: {
        amount: params.income.replacementWagesForDays.amount,
        unitNominal: params.income.replacementWagesForDays.unitNominal,
        total: params.income.replacementWagesForDays.total
      },
      bpjsHealthAllowance: params.income.bpjsHealthAllowance
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};

export const createStaffSalarySlipt = async (params) => {
  const requestBody = {
    staffId: params.staffId,
    name: params.name,
    locationId: params.locationId,
    payrollDate: params.payrollDate,
    startDate: params.startDate,
    endDate: params.endDate,
    income: {
      basicIncome: params.income.basicIncome,
      annualIncrementIncentive: params.income.annualIncrementIncentive,
      attendanceAllowance: params.income.attendanceAllowance,
      entertainAllowance: params.income.entertainAllowance,
      transportAllowance: params.income.transportAllowance,
      functionalAllowance: params.income.functionalAllowance,
      hardshipAllowance: params.income.hardshipAllowance,
      familyAllowance: params.income.familyAllowance,
      bpjsHealthAllowance: params.income.bpjsHealthAllowance,
      clinicTurnoverBonus: params.income.clinicTurnoverBonus
    },
    expense: {
      absent: {
        amount: params.expense.notComingToWork.amount,
        unitNominal: params.expense.notComingToWork.unitNominal,
        total: params.expense.notComingToWork.total
      },
      notWearingAttribute: {
        amount: params.expense.notWearingWorkAttributes.amount,
        unitNominal: params.expense.notWearingWorkAttributes.unitNominal,
        total: params.expense.notWearingWorkAttributes.total
      },
      late: {
        amount: params.expense.late.amount,
        unitNominal: params.expense.late.unitNominal,
        total: params.expense.late.total
      },
      currentMonthCashAdvance: params.expense.currentMonthCashAdvance,
      remainingDebtLastMonth: params.expense.remainingDebtLastMonth,
      stockOpnameInventory: params.expense.stockOpnameInventory
    }
  };

  return await createSalarySlipt(requestBody);
};
