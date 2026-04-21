import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import {
  createFinanceExpense,
  getFinanceVendorList,
  createFinanceVendor,
  getFinanceCategoryList,
  createFinanceCategory,
  getFinanceExpenseTypeList,
  createFinanceExpenseType,
  getFinanceDepartmentList,
  createFinanceDepartment,
  getFinancePaymentStatusList,
  createFinancePaymentStatus,
  getFinancePaymentMethodList,
  createFinancePaymentMethod
} from '../../service';
import { Grid, InputLabel, Stack, TextField, Autocomplete } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';
import ModalC from 'components/ModalC';
import IconButton from 'components/@extended/IconButton';
import ErrorContainer from 'components/@extended/ErrorContainer';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import FormQuickCreate from './FormQuickCreate';
import NumberFormatCustom from 'utils/number-format';
import PropTypes from 'prop-types';

const INITIAL_FORM = {
  transactionDate: null,
  referenceNo: '',
  vendorId: null,
  locationId: null,
  categoryId: null,
  expenseTypeId: null,
  departmentId: null,
  subTotal: '',
  tax: '',
  pph: '',
  grandTotal: '',
  paymentStatusId: null,
  paymentMethodId: null,
  dueDate: null,
  description: '',
  image: null
};

const FormExpense = (props) => {
  const dispatch = useDispatch();
  const [formValue, setFormValue] = useState({ ...INITIAL_FORM });
  const [files, setFiles] = useState(null);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });

  // Dropdown data
  const [vendorList, setVendorList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [expenseTypeList, setExpenseTypeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [paymentStatusList, setPaymentStatusList] = useState([]);
  const [paymentMethodList, setPaymentMethodList] = useState([]);

  // Quick-create modal states
  const [quickCreate, setQuickCreate] = useState({ open: false, type: '' });

  const loadDropdowns = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        getFinanceVendorList(),
        getLocationList(),
        getFinanceCategoryList(),
        getFinanceExpenseTypeList(),
        getFinanceDepartmentList(),
        getFinancePaymentStatusList(),
        getFinancePaymentMethodList()
      ]);

      const getValue = (result) => (result.status === 'fulfilled' ? result.value : []);
      setVendorList(getValue(results[0]));
      setLocationList(getValue(results[1]));
      setCategoryList(getValue(results[2]));
      setExpenseTypeList(getValue(results[3]));
      setDepartmentList(getValue(results[4]));
      setPaymentStatusList(getValue(results[5]));
      setPaymentMethodList(getValue(results[6]));
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  }, []);

  useEffect(() => {
    if (props.open) {
      loadDropdowns();
      setFormValue({ ...INITIAL_FORM });
      setFiles(null);
      setErrContent({ title: '', detail: '' });
    }
  }, [props.open, loadDropdowns]);

  // Auto-calculate grand total
  const getNumber = (val) => parseFloat(val) || 0;
  const subTotal = getNumber(formValue.subTotal);
  const tax = getNumber(formValue.tax);
  const pph = getNumber(formValue.pph);
  const grandTotal = subTotal + tax - pph;

  const onFieldHandler = (event) => {
    setFormValue((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onAmountFieldHandler = (event) => {
    const rawValue = event.target.value.replace(/,/g, '');
    setFormValue((prev) => ({ ...prev, [event.target.name]: rawValue }));
  };

  const onSubmit = async () => {
    setErrContent({ title: '', detail: '' });

    const payload = {
      transactionDate: formValue.transactionDate ? dayjs(formValue.transactionDate).format('YYYY-MM-DD') : '',
      referenceNo: formValue.referenceNo,
      vendorId: formValue.vendorId?.value || '',
      locationId: formValue.locationId?.value || '',
      subTotal: formValue.subTotal,
      tax: formValue.tax,
      pph: formValue.pph,
      grandTotal: grandTotal.toString(),
      categoryId: formValue.categoryId?.value || '',
      expenseTypeId: formValue.expenseTypeId?.value || '',
      departmentId: formValue.departmentId?.value || '',
      paymentStatusId: formValue.paymentStatusId?.value || '',
      dueDate: formValue.dueDate ? dayjs(formValue.dueDate).format('YYYY-MM-DD') : '',
      paymentMethodId: formValue.paymentMethodId?.value || '',
      description: formValue.description,
      image: files && files[0] ? files[0] : null
    };

    await createFinanceExpense(payload)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Expense created successfully'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
          const { msg, detail } = createMessageBackend(err, true);
          setErrContent({ title: msg, detail: detail });
        }
      });
  };

  const onCancel = () => props.onClose(false);

  // Quick create config mapping
  const quickCreateConfig = {
    vendor: {
      title: 'Add Vendor',
      fieldName: 'vendorName',
      createFunc: createFinanceVendor,
      getList: getFinanceVendorList,
      setList: setVendorList
    },
    category: {
      title: 'Add Category',
      fieldName: 'categoryName',
      createFunc: createFinanceCategory,
      getList: getFinanceCategoryList,
      setList: setCategoryList
    },
    expenseType: {
      title: 'Add Expense Type',
      fieldName: 'expenseType',
      createFunc: createFinanceExpenseType,
      getList: getFinanceExpenseTypeList,
      setList: setExpenseTypeList
    },
    department: {
      title: 'Add Department',
      fieldName: 'departmentName',
      createFunc: createFinanceDepartment,
      getList: getFinanceDepartmentList,
      setList: setDepartmentList
    },
    paymentStatus: {
      title: 'Add Payment Status',
      fieldName: 'paymentStatus',
      createFunc: createFinancePaymentStatus,
      getList: getFinancePaymentStatusList,
      setList: setPaymentStatusList
    },
    paymentMethod: {
      title: 'Add Payment Method',
      fieldName: 'paymentMethod',
      createFunc: createFinancePaymentMethod,
      getList: getFinancePaymentMethodList,
      setList: setPaymentMethodList
    }
  };

  const onCloseQuickCreate = async (isSuccess) => {
    if (isSuccess) {
      const config = quickCreateConfig[quickCreate.type];
      if (config) {
        const newList = await config.getList();
        config.setList(newList);
      }
    }
    setQuickCreate({ open: false, type: '' });
  };

  const renderDropdownWithAdd = (id, value, options, onChange, quickType) => (
    <Grid container spacing={1}>
      <Grid item sm={12} xs={12} md={11} paddingLeft={'unset !important'} paddingTop={'unset !important'}>
        <Autocomplete
          id={id}
          options={options}
          value={value}
          isOptionEqualToValue={(option, val) => val === '' || val === null || option.value === val?.value}
          onChange={(_, selected) => onChange(selected)}
          renderInput={(params) => <TextField {...params} />}
        />
      </Grid>
      <Grid item sm={12} xs={12} md={1} paddingLeft={'5px'} paddingTop={'2px !important'}>
        <IconButton size="medium" variant="contained" color="primary" onClick={() => setQuickCreate({ open: true, type: quickType })}>
          <PlusOutlined />
        </IconButton>
      </Grid>
    </Grid>
  );

  const currentQuickConfig = quickCreateConfig[quickCreate.type];

  return (
    <>
      <ModalC
        title={<FormattedMessage id="create-expense" />}
        open={props.open}
        onOk={onSubmit}
        onCancel={onCancel}
        maxWidth="lg"
        fullWidth
      >
        <ErrorContainer open={Boolean(errContent.title || errContent.detail)} content={errContent} />

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="transaction-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formValue.transactionDate}
                  onChange={(newValue) => setFormValue((prev) => ({ ...prev, transactionDate: newValue }))}
                  renderInput={(params) => <TextField id="transactionDate" name="transactionDate" {...params} />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="reference-no" />
              </InputLabel>
              <TextField fullWidth name="referenceNo" value={formValue.referenceNo} onChange={onFieldHandler} />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="supplier2" />
              </InputLabel>
              {renderDropdownWithAdd(
                'vendorId',
                formValue.vendorId,
                vendorList,
                (selected) => setFormValue((prev) => ({ ...prev, vendorId: selected })),
                'vendor'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="location" />
              </InputLabel>
              <Autocomplete
                id="locationId"
                options={locationList}
                value={formValue.locationId}
                isOptionEqualToValue={(option, val) => val === '' || val === null || option.value === val?.value}
                onChange={(_, selected) => setFormValue((prev) => ({ ...prev, locationId: selected }))}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="category" />
              </InputLabel>
              {renderDropdownWithAdd(
                'categoryId',
                formValue.categoryId,
                categoryList,
                (selected) => setFormValue((prev) => ({ ...prev, categoryId: selected })),
                'category'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Sub Total</InputLabel>
              <TextField
                fullWidth
                name="subTotal"
                value={formValue.subTotal}
                onChange={onAmountFieldHandler}
                InputProps={{ startAdornment: 'Rp', inputComponent: NumberFormatCustom }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="department" />
              </InputLabel>
              {renderDropdownWithAdd(
                'departmentId',
                formValue.departmentId,
                departmentList,
                (selected) => setFormValue((prev) => ({ ...prev, departmentId: selected })),
                'department'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>PPH</InputLabel>
              <TextField
                fullWidth
                name="pph"
                value={formValue.pph}
                onChange={onAmountFieldHandler}
                InputProps={{ startAdornment: 'Rp', inputComponent: NumberFormatCustom }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="expense-type" />
              </InputLabel>
              {renderDropdownWithAdd(
                'expenseTypeId',
                formValue.expenseTypeId,
                expenseTypeList,
                (selected) => setFormValue((prev) => ({ ...prev, expenseTypeId: selected })),
                'expenseType'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>Tax (PPN)</InputLabel>
              <TextField
                fullWidth
                name="tax"
                value={formValue.tax}
                onChange={onAmountFieldHandler}
                InputProps={{ startAdornment: 'Rp', inputComponent: NumberFormatCustom }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="payment-status" />
              </InputLabel>
              {renderDropdownWithAdd(
                'paymentStatusId',
                formValue.paymentStatusId,
                paymentStatusList,
                (selected) => setFormValue((prev) => ({ ...prev, paymentStatusId: selected })),
                'paymentStatus'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="grand-total" />
              </InputLabel>
              <TextField
                fullWidth
                name="grandTotal"
                value={grandTotal}
                InputProps={{ readOnly: true, startAdornment: 'Rp', inputComponent: NumberFormatCustom }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="payment-method" />
              </InputLabel>
              {renderDropdownWithAdd(
                'paymentMethodId',
                formValue.paymentMethodId,
                paymentMethodList,
                (selected) => setFormValue((prev) => ({ ...prev, paymentMethodId: selected })),
                'paymentMethod'
              )}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="due-date" />
              </InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={formValue.dueDate}
                  onChange={(newValue) => setFormValue((prev) => ({ ...prev, dueDate: newValue }))}
                  renderInput={(params) => <TextField id="dueDate" name="dueDate" {...params} />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="description" />
              </InputLabel>
              <TextField fullWidth multiline rows={3} name="description" value={formValue.description} onChange={onFieldHandler} />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="attachment" />
              </InputLabel>
              <SingleFileUpload file={files} setFieldValue={(key, value) => setFiles(value)} sx={{ height: 'auto' }} />
            </Stack>
          </Grid>
        </Grid>
      </ModalC>

      {quickCreate.open && currentQuickConfig && (
        <FormQuickCreate
          open={quickCreate.open}
          onClose={onCloseQuickCreate}
          title={currentQuickConfig.title}
          fieldName={currentQuickConfig.fieldName}
          createFunc={currentQuickConfig.createFunc}
        />
      )}
    </>
  );
};

FormExpense.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormExpense;
