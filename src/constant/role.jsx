export const CONSTANT_ADMINISTRATOR = 'administrator';
export const CONSTANT_MANAGER = 'manager';
export const CONSTANT_STAFF = 'staff';

// Job title names — harus cocok dengan nilai jobName dari JWT
export const JOB_KASIR      = 'Kasir';
export const JOB_HELPER     = 'Helper';
export const JOB_PARAMEDIS  = 'Paramedis';
export const JOB_VETNURSE   = 'Vetnurse';
export const JOB_DOKTER     = 'Dokter Hewan';

// Helper: apakah user adalah Admin atau Manager
export const isAdminOrManager = (role) =>
  [CONSTANT_ADMINISTRATOR, CONSTANT_MANAGER].includes(role);
