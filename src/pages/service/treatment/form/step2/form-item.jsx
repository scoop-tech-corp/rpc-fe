import {
  Autocomplete,
  Box,
  Checkbox,
  Button,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  Stack,
  TextField,
  Select,
  MenuItem
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { defaultTreatmentForm, useTreatmentStore } from '../../treatment-form-store';
import useGetList from 'hooks/useGetList';
import { getProductList, getTaskList, updateTreatmentItems } from '../../service';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, generateUniqueIdByDate } from 'service/service-global';

export default function FormService({ step, setStep, setParams }) {
  const dispatch = useDispatch();

  const totalColumn = useTreatmentStore((state) => state.formStep2.totalColumn);
  const frequencyList = useTreatmentStore((state) => state.dataSupport.frequencyList);
  const serviceList = useTreatmentStore((state) => state.dataSupport.serviceList);
  const taskList = useTreatmentStore((state) => state.dataSupport.taskList);
  const treatmentDetail = useTreatmentStore((state) => state.dataSupport.treatmentDetail);

  const serviceId = useTreatmentStore((state) => state.formStep2Item.service_id);
  const taskId = useTreatmentStore((state) => state.formStep2Item.task_id);
  const productName = useTreatmentStore((state) => state.formStep2Item.product_name);
  const productType = useTreatmentStore((state) => state.formStep2Item.product_type);
  const quantity = useTreatmentStore((state) => state.formStep2Item.quantity);

  const isEdit = useTreatmentStore((state) => state.formStep2Item.isEdit);

  const [inputValue, setInputValue] = useState('');

  const onChange = (name, val, resetName) => {
    useTreatmentStore.setState({ formStep2Item: { ...useTreatmentStore.getState().formStep2Item, [name]: val, [resetName]: '' } });
  };

  const listProduct = useGetList(getProductList, { disabled: true, locationId: '[]', api: '' });

  const regetTaskList = async () => {
    useTreatmentStore.setState({
      dataSupport: {
        ...useTreatmentStore.getState().dataSupport,
        taskList: await getTaskList()
      }
    });
  };
  const onSubmit = async () => {
    const catchError = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    const params = {
      start: useTreatmentStore.getState().formStep2Item.start,
      frequency_id: useTreatmentStore.getState().formStep2Item.frequency_id?.value,
      duration: useTreatmentStore.getState().formStep2Item.duration,
      notes: useTreatmentStore.getState().formStep2Item.notes,
      treatments_id: treatmentDetail?.id,
      isEdit: useTreatmentStore.getState().formStep2Item.isEdit,
      id: useTreatmentStore.getState().formStep2Item.id
    };

    if (step == 2) {
      params.product_name = useTreatmentStore.getState().formStep2Item.product_name;
      params.product_type = useTreatmentStore.getState().formStep2Item.product_type;
      params.quantity = useTreatmentStore.getState().formStep2Item.quantity;
    }

    if (step == 3 && !isEdit) {
      params.service_id = useTreatmentStore.getState()?.formStep2Item.service_id?.value;
    }

    if (step == 4) {
      params.task_id = useTreatmentStore.getState()?.formStep2Item.task_id;
    }
    await updateTreatmentItems(params)
      .then(() => {
        dispatch(snackbarSuccess(`Item has been created successfully`));
        useTreatmentStore.setState(
          {
            ...useTreatmentStore.getState(),
            formStep2Item: {
              ...defaultTreatmentForm.formStep2Item,
              isAnother: useTreatmentStore.getState().formStep2Item.isAnother
            }
          },
          true
        );

        setParams((_params) => ({ ..._params }));

        if (step == 4) {
          regetTaskList();
        }
        if (!useTreatmentStore.getState().formStep2Item.isAnother) {
          setStep(1);
        }
      })
      .catch(catchError);
  };

  useEffect(() => {
    if (productType && step == 2) {
      listProduct.setParams((e) => ({
        ...e,
        disabled: treatmentDetail?.location_id.length === 0,
        locationId: '[' + treatmentDetail?.location_id + ']' || '[]',
        api: productType === 'product-sell' ? 'product/sell/list/location' : 'product/clinic/list/location'
      }));
    }
  }, [productType, step, treatmentDetail?.location_id?.length]);

  const validation =
    step == 3
      ? serviceId && frequencyList && useTreatmentStore.getState().formStep2Item.duration
      : step == 2
      ? productName && quantity && frequencyList && useTreatmentStore.getState().formStep2Item.duration
      : step == 4
      ? taskId && frequencyList && useTreatmentStore.getState().formStep2Item.duration
      : '';

  return (
    <div>
      <Grid item xs={12} sm={12}>
        {step == 2 ? (
          <>
            {!isEdit && (
              <Stack>
                <InputLabel sx={{ mt: 2 }} htmlFor="product-type">
                  {<FormattedMessage id="product-type" />} *
                </InputLabel>
                <Select
                  id="select-type"
                  value={productType}
                  name="productType"
                  onChange={(e) => onChange('product_type', e.target.value, 'product_name')}
                >
                  <MenuItem value={'product-sell'}>
                    <FormattedMessage id="product-sell" />
                  </MenuItem>
                  <MenuItem value={'product-clinic'}>
                    <FormattedMessage id="product-clinic" />
                  </MenuItem>
                </Select>
              </Stack>
            )}
            <Stack>
              <InputLabel sx={{ mt: 2 }} htmlFor="productName">
                {<FormattedMessage id="product" />} *
              </InputLabel>
              <Autocomplete
                id="productName"
                value={productName}
                options={listProduct?.list?.map((item) => ({
                  label: item.fullName,
                  value: item.fullName
                }))}
                disabled={isEdit}
                onChange={(e, val) => onChange('product_name', val.value)}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </>
        ) : step == 3 ? (
          <Stack>
            <InputLabel sx={{ mt: 2 }} htmlFor="service">
              {<FormattedMessage id="service" />} *
            </InputLabel>
            <Autocomplete
              id="service"
              disabled={isEdit}
              value={serviceId}
              options={serviceList}
              onChange={(e, val) => onChange('service_id', val)}
              // isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        ) : (
          <Stack>
            <InputLabel sx={{ mt: 2 }} htmlFor="task">
              {<FormattedMessage id="task" />} *
            </InputLabel>
            <Autocomplete
              fullWidth
              disabled={isEdit}
              id="task"
              noOptionsText="Enter to create a new option"
              options={taskList || []}
              value={taskId}
              sx={{ height: '100%' }}
              onChange={(e, val) => onChange('task_id', val)}
              onInputChange={(e, newValue) => {
                setInputValue(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && taskList.findIndex((o) => o.label === inputValue) === -1) {
                      useTreatmentStore.setState((state) => ({
                        dataSupport: {
                          ...state.dataSupport,
                          taskList: [...state.dataSupport.taskList, { label: inputValue, value: generateUniqueIdByDate(), isNew: true }]
                        }
                      }));
                    }
                  }}
                />
              )}
            />
          </Stack>
        )}
        <Stack>
          <InputLabel sx={{ mt: 2 }} htmlFor="start">
            {<FormattedMessage id="start" />} *
          </InputLabel>
          <Select
            id="start"
            value={useTreatmentStore((state) => state.formStep2Item.start)}
            onChange={(e) => onChange('start', e.target.value, 'duration')}
          >
            {Array.from({ length: totalColumn }, (_, i) => (
              <MenuItem key={i} value={i + 1}>
                {i + 1}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        {step == 2 && (
          <Stack>
            <InputLabel sx={{ mt: 2 }} htmlFor="quantity">
              {<FormattedMessage id="quantity" />} *
            </InputLabel>
            <TextField id="quantity" type="number" value={quantity} onChange={(e) => onChange('quantity', e.target.value)} />
          </Stack>
        )}
        <Stack>
          <InputLabel sx={{ mt: 2 }} htmlFor="frequency">
            {<FormattedMessage id="frequency" />} *
          </InputLabel>
          <Autocomplete
            id="frequency"
            value={useTreatmentStore((state) => state.formStep2Item.frequency_id)}
            options={frequencyList}
            onChange={(e, val) => onChange('frequency_id', val)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
        <Stack>
          <InputLabel sx={{ mt: 2 }} htmlFor="duration">
            {<FormattedMessage id="duration" />} *
          </InputLabel>
          <Select
            id="duration"
            value={useTreatmentStore((state) => state.formStep2Item.duration)}
            onChange={(e) => onChange('duration', e.target.value)}
          >
            {Array.from({ length: totalColumn - (useTreatmentStore.getState().formStep2Item.start - 1) }, (_, i) => (
              <MenuItem value={i + 1} key={i}>
                {i + 1}
              </MenuItem>
            ))}
          </Select>
        </Stack>
        <Stack>
          <InputLabel sx={{ mt: 2 }} htmlFor="duration">
            {<FormattedMessage id="notes" />}
          </InputLabel>
          <TextField
            id="notes"
            value={useTreatmentStore((state) => state.formStep2Item.notes)}
            multiline
            rows={3}
            onChange={(e) => onChange('notes', e.target.value)}
          />
        </Stack>
        <Stack>
          <FormControl sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  sx={{ mt: -0.1 }}
                  defaultChecked={useTreatmentStore((state) => state.formStep2Item.isAnother == 1)}
                  onChange={(e) => onChange('isAnother', e.target.checked)}
                />
              }
              label={
                <FormattedMessage
                  id={step == 2 ? 'create-another-product' : step == 3 ? 'create-another-service' : step == 4 ? 'create-another-task' : ''}
                />
              }
            />
          </FormControl>
          <Box sx={{ display: 'flex', gap: 1, marginTop: 2 }}>
            <Button
              variant="outlined"
              sx={{ mb: 2 }}
              fullWidth
              color="error"
              onClick={() => {
                setStep(1);
                useTreatmentStore.setState(
                  {
                    ...useTreatmentStore.getState(),
                    formStep2Item: {
                      ...defaultTreatmentForm.formStep2Item
                    }
                  },
                  true
                );
              }}
            >
              <FormattedMessage id="cancel" />
            </Button>
            <Button variant="outlined" sx={{ mb: 2 }} fullWidth color="primary" onClick={onSubmit} disabled={!validation}>
              <FormattedMessage id="save" />
            </Button>
          </Box>
        </Stack>
      </Grid>
    </div>
  );
}
