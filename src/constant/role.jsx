export const CONSTANT_ADMINISTRATOR = 'administrator';
export const CONSTANT_MANAGER = 'manager';
export const CONSTANT_STAFF = 'staff';

// Job title names — harus cocok dengan nilai jobName dari JWT
export const JOB_KASIR = 'Kasir';
export const JOB_HELPER = 'Helper';
export const JOB_GROOMER = 'Groomer';
export const JOB_PARAMEDIS = 'Paramedis';
export const JOB_VETNURSE = 'Vetnurse';
export const JOB_DOKTER = 'Dokter Hewan';
export const JOB_FINANCE = 'Finance';
export const JOB_STAFF_HR = 'Staff HR';
export const JOB_MANAGER_HR = 'Manager HR';
export const JOB_STAFF_GA = 'Staff General Affair';
export const JOB_MANAGER_GA = 'Manager General Affair';
export const JOB_STAFF_PR = 'Staff Public Relation';
export const JOB_MANAGER_PR = 'Manager Public Relation';
export const JOB_STAFF_AUDIT = 'Staff Internal Audit';
export const JOB_MANAGER_AUDIT = 'Manager Internal Audit';
export const JOB_STAFF_DE = 'Staff Digital Enterprise';
export const JOB_MANAGER_DE = 'Manager Digital Enterprise';
export const JOB_QC_TRAINER = 'Quality Control & Trainer';
export const JOB_PRESIDENT_DIRECTOR = 'President Director';
export const JOB_KOMISARIS = 'Komisaris';

// Helper: apakah user adalah Admin atau Manager
export const isAdminOrManager = (role) => [CONSTANT_ADMINISTRATOR, CONSTANT_MANAGER].includes(role);
