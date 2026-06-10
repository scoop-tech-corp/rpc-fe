import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { createMessageBackend, getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { ReactTable } from 'components/third-party/ReactTable';
import { createServiceAndRecipe } from '../../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import ScrollX from 'components/ScrollX';

const ServiceAndRecipe = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({
    service: null,
    quantity: '',
    isGiveRecipe: false,
    productClinic: null,
    dosage: '',
    unit: '',
    frequency: '',
    duration: '',
    medication: '',
    notes: '',
    services: [],
    summary: []
  });

  const [formDropdown, setFormDropdown] = useState({
    serviceList: [],
    productClinicList: []
  });

  const [disabledOke, setDisabledOk] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      try {
        const [respService, respProductClinic] = await Promise.all([
          getServiceListByLocation([data.locationId]),
          getProductSellClinicByLocation('clinic', [data.locationId])
        ]);
        setFormDropdown((prevState) => ({
          ...prevState,
          serviceList: respService,
          productClinicList: respProductClinic
        }));
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      } finally {
        loaderGlobalConfig.setLoader(false);
        loaderService.setManualLoader(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formValue.summary.length && !formValue.services.length) setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  // ── Column definitions ─────────────────────────────────────────────
  const columnsService = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (d) => d.row.index + 1
      },
      {
        Header: <FormattedMessage id="service-name" />,
        accessor: 'serviceName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (d) => (
          <IconButton
            size="medium"
            variant="contained"
            aria-label="delete"
            color="error"
            onClick={() => onDeleteRowHandler('services', d.row.index)}
          >
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const columnSummary = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (d) => d.row.index + 1
      },
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productClinicName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="dosage" />,
        accessor: 'dosage',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit" />,
        accessor: 'unit',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="frequency" />,
        accessor: 'frequency',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="duration" />,
        accessor: 'duration',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="medication" />,
        accessor: 'medication',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="notes" />,
        accessor: 'notes',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (d) => (
          <IconButton
            size="medium"
            variant="contained"
            aria-label="delete"
            color="error"
            onClick={() => onDeleteRowHandler('summary', d.row.index)}
          >
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Handlers ───────────────────────────────────────────────────────
  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prevState) => {
      const prevTableList = [...prevState[procedure]];
      prevTableList.splice(rowIndex, 1);
      return { ...prevState, [procedure]: prevTableList };
    });
  };

  const onFieldHandler = (event) =>
    setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));

  const onDisabledService = () => !formValue.service || !formValue.quantity;

  const onAddService = () => {
    if (onDisabledService()) return;
    setFormValue((prevState) => ({
      ...prevState,
      service: null,
      quantity: '',
      services: [
        ...prevState.services,
        {
          serviceId: prevState.service.id,
          serviceName: prevState.service.label,
          quantity: prevState.quantity
        }
      ]
    }));
  };

  const onDisabledSummary = () =>
    !formValue.productClinic ||
    !formValue.dosage ||
    !formValue.unit ||
    !formValue.frequency ||
    !formValue.duration ||
    !formValue.medication ||
    !formValue.notes;

  const onAddSummary = () => {
    if (onDisabledSummary()) return;
    setFormValue((prevState) => ({
      ...prevState,
      productClinic: null,
      dosage: '',
      unit: '',
      frequency: '',
      duration: '',
      medication: '',
      notes: '',
      summary: [
        ...prevState.summary,
        {
          productClinicId: prevState.productClinic.value,
          productClinicName: prevState.productClinic.label,
          dosage: prevState.dosage,
          unit: prevState.unit,
          frequency: prevState.frequency,
          duration: prevState.duration,
          medication: prevState.medication,
          notes: prevState.notes
        }
      ]
    }));
  };

  const onSubmit = async () => {
    setDisabledOk(true);
    await createServiceAndRecipe({ ...formValue, transactionPetClinicId: data.transactionId })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success create service and recipe'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      })
      .finally(() => setDisabledOk(false));
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <ModalC
      title={<FormattedMessage id="service-and-recipe" />}
      open={props.open}
      onOk={() => onSubmit()}
      disabledOk={disabledOke}
      onCancel={() => props.onClose(false)}
      fullWidth
      maxWidth="md"
    >
      <Grid container spacing={3}>

        {/* ── SERVICE SECTION ── */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="service">
              <FormattedMessage id="service" />
            </InputLabel>
            <Autocomplete
              id="service"
              options={formDropdown.serviceList}
              value={formValue.service}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, selected) => onFieldHandler({ target: { name: 'service', value: selected } })}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="quantity">
              <FormattedMessage id="quantity" />
            </InputLabel>
            <TextField
              fullWidth
              type="number"
              id="quantity"
              name="quantity"
              inputProps={{ min: 1 }}
              value={formValue.quantity}
              onChange={onFieldHandler}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} md={1} display="flex" alignItems="flex-end" justifyContent="center">
          <IconButton
            size="medium"
            variant="contained"
            aria-label="add-service"
            color="primary"
            onClick={onAddService}
            disabled={onDisabledService()}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>

        {/* ── GIVE RECIPE CHECKBOX ── */}
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formValue.isGiveRecipe}
                onChange={(e) => setFormValue((prev) => ({ ...prev, isGiveRecipe: e.target.checked }))}
                name="isGiveRecipe"
              />
            }
            label={<FormattedMessage id="give-a-recipe" />}
          />
        </Grid>

        {/* ── RECIPE SECTION (conditional) ── */}
        {formValue.isGiveRecipe && (
          <>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="productClinic">
                  <FormattedMessage id="product-clinic" />
                </InputLabel>
                <Autocomplete
                  id="productClinic"
                  options={formDropdown.productClinicList}
                  value={formValue.productClinic}
                  isOptionEqualToValue={(option, val) => val === '' || option.id === val.id}
                  onChange={(_, selected) => {
                    const selectedValue = selected ? { ...selected, value: +selected.id } : null;
                    // auto-fill unit dari data produk jika tersedia
                    const autoUnit = selected?.unit || '';
                    setFormValue((prev) => ({
                      ...prev,
                      productClinic: selectedValue,
                      unit: autoUnit || prev.unit
                    }));
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="dosage">
                  <FormattedMessage id="dosage" />
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="dosage"
                  name="dosage"
                  inputProps={{ min: 0 }}
                  value={formValue.dosage}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="unit">
                  <FormattedMessage id="unit" />
                  {formValue.productClinic?.unit && (
                    <span style={{ marginLeft: 6, fontSize: 11, color: '#888', fontWeight: 400 }}>
                      (otomatis dari produk)
                    </span>
                  )}
                </InputLabel>
                {formValue.productClinic?.unit ? (
                  <TextField
                    fullWidth
                    id="unit"
                    name="unit"
                    value={formValue.unit}
                    inputProps={{ readOnly: true }}
                    sx={{ '& .MuiInputBase-input': { bgcolor: 'action.hover', cursor: 'not-allowed' } }}
                  />
                ) : (
                  <Select fullWidth name="unit" value={formValue.unit} onChange={onFieldHandler}>
                    <MenuItem value="gr">gr</MenuItem>
                    <MenuItem value="mg">mg</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                    <MenuItem value="cc">cc</MenuItem>
                  </Select>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="frequency">
                  <FormattedMessage id="frequency" />
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="frequency"
                  name="frequency"
                  inputProps={{ min: 1 }}
                  value={formValue.frequency}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="duration">
                  <FormattedMessage id="duration" />
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="duration"
                  name="duration"
                  inputProps={{ min: 1 }}
                  value={formValue.duration}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="medication">
                  <FormattedMessage id="medication" />
                </InputLabel>
                <Select fullWidth name="medication" value={formValue.medication} onChange={onFieldHandler}>
                  <MenuItem value="oral">oral</MenuItem>
                  <MenuItem value="tropical">tropical</MenuItem>
                  <MenuItem value="injeksi">injeksi</MenuItem>
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12} md={1} display="flex" alignItems="flex-end" justifyContent="center">
              <IconButton
                size="medium"
                variant="contained"
                aria-label="add-recipe"
                color="primary"
                onClick={onAddSummary}
                disabled={onDisabledSummary()}
              >
                <PlusOutlined />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="notes">
                  <FormattedMessage id="notes" />
                </InputLabel>
                <TextField
                  multiline
                  fullWidth
                  rows={3}
                  id="notes"
                  name="notes"
                  value={formValue.notes}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
          </>
        )}

        {/* ── SUMMARY TABLES ── */}
        <Grid item xs={12}>
          <InputLabel style={{ fontWeight: 'bold' }}>
            <FormattedMessage id="summary" />
          </InputLabel>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel>
              <FormattedMessage id="service" />
            </InputLabel>
            <ReactTable columns={columnsService} data={formValue.services} />
          </Stack>
        </Grid>

        {formValue.isGiveRecipe && (
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="product-clinic" />
              </InputLabel>
              <ScrollX>
                <ReactTable columns={columnSummary} data={formValue.summary} />
              </ScrollX>
            </Stack>
          </Grid>
        )}

      </Grid>
    </ModalC>
  );
};

ServiceAndRecipe.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ServiceAndRecipe;
