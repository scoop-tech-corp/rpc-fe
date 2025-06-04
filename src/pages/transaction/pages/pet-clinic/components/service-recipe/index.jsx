import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  useMediaQuery
} from '@mui/material';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { createMessageBackend, getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      Promise.all([getServiceListByLocation([data.locationId]), getProductSellClinicByLocation('clinic', [data.locationId])])
        .finally(() => {
          loaderGlobalConfig.setLoader(false);
          loaderService.setManualLoader(false);
        })
        .then(([respService, respProductClinic]) => {
          setFormDropdown((prevState) => ({
            ...prevState,
            serviceList: respService,
            productClinicList: respProductClinic
          }));
        });
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!formValue.summary.length || !formValue.services.length) setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  const columnsService = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => {
          const rowIndex = data.row.index;
          return rowIndex + 1;
        }
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
        Cell: (data) => {
          const rowIndex = data.row.index;

          return (
            <IconButton
              size="medium"
              variant="contained"
              aria-label="refresh"
              color="error"
              onClick={() => onDeleteRowHandler('services', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  const columnSummary = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => data.row.index + 1
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
        Cell: (data) => {
          const rowIndex = data.row.index;

          return (
            <IconButton
              size="medium"
              variant="contained"
              aria-label="refresh"
              color="error"
              onClick={() => onDeleteRowHandler('summary', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );
  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prevState) => {
      const prevTableList = prevState[procedure];
      prevTableList.splice(rowIndex, 1);

      return { ...prevState, [procedure]: [...prevTableList] };
    });
  };
  const onFieldHandler = (event) => setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  const onDisabledService = () => !formValue.service || !formValue.quantity;
  const onAddService = () => {
    if (onDisabledService()) return;

    setFormValue((prevState) => {
      const prevServices = prevState.services || [];
      const newRow = {
        serviceId: prevState.service.id,
        serviceName: prevState.service.label,
        quantity: prevState.quantity
      };

      return { ...prevState, service: null, quantity: '', services: [...prevServices, newRow] };
    });
  };
  const onDisabledSummary = () => {
    return (
      !formValue.productClinic ||
      !formValue.dosage ||
      !formValue.unit ||
      !formValue.frequency ||
      !formValue.duration ||
      !formValue.medication ||
      !formValue.notes
    );
  };
  const onAddSummary = () => {
    if (onDisabledSummary()) return;

    setFormValue((prevState) => {
      const prevSummary = prevState.summary || [];
      const newRow = {
        productClinicId: prevState.productClinic.value,
        productClinicName: prevState.productClinic.label,
        dosage: prevState.dosage,
        unit: prevState.unit,
        frequency: prevState.frequency,
        duration: prevState.duration,
        medication: prevState.medication,
        notes: prevState.notes
      };

      return {
        ...prevState,
        productClinic: null,
        dosage: '',
        unit: '',
        frequency: '',
        duration: '',
        medication: '',
        notes: '',
        summary: [...prevSummary, newRow]
      };
    });
  };

  const onSubmit = async () => {
    console.log('form value', formValue);

    await createServiceAndRecipe({ ...formValue, transactionPetClinicId: data.transactionId })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Success create service and recipe'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="service-and-recipe" />}
        open={props.open}
        onOk={() => onSubmit()}
        disabledOk={disabledOke}
        onCancel={() => props.onClose(false)}
        fullWidth
        maxWidth="md"
      >
        <Box marginBottom={'25px'}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="service">
                  <FormattedMessage id="service" />
                </InputLabel>
                <Autocomplete
                  id="service"
                  name="service"
                  options={formDropdown.serviceList}
                  value={formValue.service}
                  isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                  onChange={(_, selected) => onFieldHandler({ target: { name: 'service', value: selected } })}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={5}>
              <Stack spacing={1.25}>
                {/* style={{ fontWeight: 'bold' }} */}
                <InputLabel htmlFor="quantity">
                  <FormattedMessage id="quantity" />
                </InputLabel>
                <TextField
                  fullWidth
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formValue.quantity}
                  onChange={(event) => onFieldHandler(event)}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} sm={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
              <IconButton
                style={{ width: matchDownSM ? '100%' : 'unset' }}
                size="medium"
                variant="contained"
                aria-label="refresh"
                color="primary"
                onClick={onAddService}
                disabled={onDisabledService()}
              >
                <PlusOutlined />
              </IconButton>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <ReactTable columns={columnsService} data={formValue.services || []} />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formValue.isGiveRecipe}
                    onChange={(event) => setFormValue((e) => ({ ...e, isGiveRecipe: event.target.checked }))}
                    name="isGiveRecipe"
                  />
                }
                label={<FormattedMessage id="give-a-recipe" />}
              />
            </Grid>
          </Grid>
        </Box>
        {formValue.isGiveRecipe && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="product-clinic">
                    <FormattedMessage id="product-clinic" />
                  </InputLabel>
                  <Autocomplete
                    id="productClinic"
                    name="productClinic"
                    options={formDropdown.productClinicList}
                    value={formValue.productClinic}
                    isOptionEqualToValue={(option, val) => val === '' || option.id === val.id}
                    onChange={(_, selected) => {
                      const selectedValue = selected ? { ...selected, value: +selected.id } : null;
                      onFieldHandler({ target: { name: 'productClinic', value: selectedValue } });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="dosage">
                    <FormattedMessage id="dosage" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="dosage"
                    name="dosage"
                    value={formValue.dosage}
                    onChange={(event) => onFieldHandler(event)}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="unit">
                    <FormattedMessage id="unit" />
                  </InputLabel>
                  <Select fullWidth name="unit" value={formValue.unit} onChange={(event) => onFieldHandler(event)}>
                    <MenuItem value="gr">gr</MenuItem>
                    <MenuItem value="mg">mg</MenuItem>
                    <MenuItem value="ml">ml</MenuItem>
                    <MenuItem value="cc">cc</MenuItem>
                  </Select>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="frequency">
                    <FormattedMessage id="frequency" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="frequency"
                    name="frequency"
                    value={formValue.frequency}
                    onChange={(event) => onFieldHandler(event)}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="duration">
                    <FormattedMessage id="duration" />
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="duration"
                    name="duration"
                    value={formValue.duration}
                    onChange={(event) => onFieldHandler(event)}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="medication">
                    <FormattedMessage id="medication" />
                  </InputLabel>
                  <Select fullWidth name="medication" value={formValue.medication} onChange={(event) => onFieldHandler(event)}>
                    <MenuItem value="oral">oral</MenuItem>
                    <MenuItem value="tropical">tropical</MenuItem>
                    <MenuItem value="injeksi">injeksi</MenuItem>
                  </Select>
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="notes">
                    <FormattedMessage id="notes" />
                  </InputLabel>
                  <TextField
                    multiline
                    fullWidth
                    rows={5}
                    id="notes"
                    name="notes"
                    value={formValue.notes}
                    onChange={(event) => onFieldHandler(event)}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="summary">
                    <FormattedMessage id="summary" />
                    <IconButton
                      size="medium"
                      variant="contained"
                      aria-label="refresh"
                      color="primary"
                      onClick={onAddSummary}
                      style={{ marginLeft: 5 }}
                      disabled={onDisabledSummary()}
                    >
                      <PlusOutlined />
                    </IconButton>
                  </InputLabel>
                  <ScrollX>
                    <ReactTable columns={columnSummary} data={formValue.summary || []} />
                  </ScrollX>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}
      </ModalC>
    </>
  );
};

ServiceAndRecipe.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ServiceAndRecipe;
