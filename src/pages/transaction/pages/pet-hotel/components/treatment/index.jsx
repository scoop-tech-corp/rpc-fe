import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getTreatmentListByLocation } from 'pages/service/treatment/service';
import { createMessageBackend, getProductSellClinicByLocation, getServiceListByLocation } from 'service/service-global';
import { getCageFacilityLocationList } from 'pages/location/facility/detail/service';
import { ReactTable } from 'components/third-party/ReactTable';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import { transactionPetHotelTreatment } from '../../service';

const TreatmentPetHotel = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({
    transactionId: data.transactionId,
    treatment: null,
    service: null,
    qtyService: '',
    productSell: null,
    qtySell: '',
    productClinic: null,
    qtyClinic: '',
    cage: null,
    serviceCategory: 'Pet Hotel',
    treatmentPlans: [],
    services: [],
    productSells: [],
    productClinics: []
  });

  const [formDropdown, setFormDropdown] = useState({
    treatmentPlanList: [],
    serviceList: [],
    productSellList: [],
    productClinicList: [],
    cageList: []
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async () => {
    console.log('formValue', formValue);
    await transactionPetHotelTreatment(formValue)
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

  const onCancel = () => props.onClose(false);

  const onFieldHandler = (event) => setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prevState) => {
      const prevTableList = prevState[procedure];
      prevTableList.splice(rowIndex, 1);

      return { ...prevState, [procedure]: [...prevTableList] };
    });
  };

  useEffect(() => {
    if (
      !formValue.cage ||
      !formValue.treatmentPlans.length ||
      !formValue.treatmentPlans.length ||
      !formValue.services.length ||
      !formValue.productSells.length ||
      !formValue.productClinics.length
    )
      setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      Promise.all([
        getTreatmentListByLocation([data.locationId]),
        getProductSellClinicByLocation('clinic', [data.locationId]),
        getServiceListByLocation([data.locationId]),
        getProductSellClinicByLocation('sell', [data.locationId]),
        getCageFacilityLocationList([data.locationId])
      ])
        .finally(() => {
          loaderGlobalConfig.setLoader(false);
          loaderService.setManualLoader(false);
        })
        .then(([respTreatmentList, respProductClinicList, respService, respProductSellList, respCageList]) => {
          console.log('respCageList', respCageList);
          console.log('respService', respService);
          console.log('respProductSellList', respProductSellList);
          console.log('respProductClinicList', respProductClinicList);
          setFormDropdown((prevState) => ({
            ...prevState,
            treatmentPlanList: respTreatmentList,
            productClinicList: respProductClinicList,
            serviceList: respService,
            productSellList: respProductSellList,
            cageList: respCageList
          }));
        });
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columnsTreatmentPlan = useMemo(
    () => [
      {
        Header: <FormattedMessage id="treatment-name" />,
        accessor: 'name',
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
              onClick={() => onDeleteRowHandler('treatmentPlans', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  const columnsService = useMemo(
    () => [
      {
        Header: <FormattedMessage id="service-name" />,
        accessor: 'name',
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

  const columnsProductSell = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'name',
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
              onClick={() => onDeleteRowHandler('productSells', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  const columnsProductClinic = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'name',
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
              onClick={() => onDeleteRowHandler('productClinics', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  return (
    <>
      <ModalC
        title={<FormattedMessage id="add-treatment" />}
        open={props.open}
        onOk={() => onSubmit()}
        disabledOk={disabledOke}
        onCancel={onCancel}
        fullWidth
        maxWidth="sm"
      >
        <Grid container spacing={3}>
          <Grid item xs={10} md={11}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="treatment-plan-list">
                <FormattedMessage id="treatment-plan-list" />
              </InputLabel>
              <Autocomplete
                id="treatmentPlan"
                name="treatmentPlan"
                options={formDropdown.treatmentPlanList}
                value={formValue.treatment}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'treatment', value: selected } })}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
          <Grid item xs={2} md={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              size="medium"
              variant="contained"
              aria-label="add"
              color="primary"
              onClick={() => {
                setFormValue((prevState) => {
                  const prevTreatmentPlans = prevState.treatmentPlans || [];
                  const newRow = {
                    id: prevState.treatment.value,
                    name: prevState.treatment.label
                  };
                  return { ...prevState, treatment: null, treatmentPlans: [...prevTreatmentPlans, newRow] };
                });
              }}
              disabled={Boolean(!formValue.treatment)}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="service-list">
                <FormattedMessage id="service-list" />
              </InputLabel>
              <Autocomplete
                id="serviceList"
                name="serviceList"
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
                name="qtyService"
                value={formValue.qtyService}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              size="medium"
              variant="contained"
              aria-label="add"
              color="primary"
              onClick={() => {
                setFormValue((prevState) => {
                  const prevServices = prevState.services || [];
                  const newRow = {
                    id: prevState.service.id,
                    name: prevState.service.label,
                    quantity: +prevState.qtyService
                  };
                  return { ...prevState, service: null, qtyService: '', services: [...prevServices, newRow] };
                });
              }}
              disabled={Boolean(!formValue.service)}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product-sell-list">
                <FormattedMessage id="product-sell-list" />
              </InputLabel>
              <Autocomplete
                id="productSellList"
                name="productSellList"
                options={formDropdown.productSellList}
                value={formValue.productSell}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'productSell', value: selected } })}
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
                id="qtySell"
                name="qtySell"
                value={formValue.qtySell}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              size="medium"
              variant="contained"
              aria-label="add"
              color="primary"
              onClick={() => {
                setFormValue((prevState) => {
                  const prevProductSells = prevState.productSells || [];
                  const newRow = {
                    id: prevState.productSell.id,
                    name: prevState.productSell.label,
                    quantity: +prevState.qtySell
                  };
                  return { ...prevState, productSell: null, qtySell: '', productSells: [...prevProductSells, newRow] };
                });
              }}
              disabled={Boolean(!formValue.productSell)}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product-clinic-list">
                <FormattedMessage id="product-clinic-list" />
              </InputLabel>
              <Autocomplete
                id="productClinicList"
                name="productClinicList"
                options={formDropdown.productClinicList}
                value={formValue.productClinic}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'productClinic', value: selected } })}
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
                id="qtyClinic"
                name="qtyClinic"
                value={formValue.qtyClinic}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              size="medium"
              variant="contained"
              aria-label="add"
              color="primary"
              onClick={() => {
                setFormValue((prevState) => {
                  const prevProductClinics = prevState.productClinics || [];
                  const newRow = {
                    id: prevState.productClinic.id,
                    name: prevState.productClinic.label,
                    quantity: +prevState.qtyClinic
                  };
                  return { ...prevState, productClinic: null, qtyClinic: '', productClinics: [...prevProductClinics, newRow] };
                });
              }}
              disabled={Boolean(!formValue.productClinic)}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="cage">
                <FormattedMessage id="cage" />
              </InputLabel>
              <Autocomplete
                id="cage"
                name="cage"
                options={formDropdown.cageList}
                value={formValue.cage}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'cage', value: selected } })}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <InputLabel htmlFor="summary" style={{ fontWeight: 'bold' }}>
              <FormattedMessage id="summary" />
            </InputLabel>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="treatment-plan">
                <FormattedMessage id="treatment-plan" />
              </InputLabel>
              <ReactTable columns={columnsTreatmentPlan} data={formValue.treatmentPlans || []} />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="service">
                <FormattedMessage id="service" />
              </InputLabel>
              <ReactTable columns={columnsService} data={formValue.services || []} />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product-sell">
                <FormattedMessage id="product-sell" />
              </InputLabel>
              <ReactTable columns={columnsProductSell} data={formValue.productSells || []} />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product-clinic">
                <FormattedMessage id="product-clinic" />
              </InputLabel>
              <ReactTable columns={columnsProductClinic} data={formValue.productClinics || []} />
            </Stack>
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

TreatmentPetHotel.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TreatmentPetHotel;
