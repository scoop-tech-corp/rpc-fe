import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Alert, Autocomplete, Chip, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
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
import { getCheckCondition, transactionPetHotelTreatment } from '../../service';

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
    stayService: null, // tarif menginap per hari
    stayServiceId: null,
    serviceCategory: 'Pet Hotel',
    treatmentPlans: [],
    services: [],
    productSells: [],
    productClinics: []
  });

  // ID kategori "Tarif Menginap Pet Hotel" — hanya untuk kalkulasi biaya harian
  const STAY_SERVICE_CATEGORY_ID = 25;

  const [formDropdown, setFormDropdown] = useState({
    treatmentPlanList: [],
    stayServiceList: [], // tarif menginap per hari (kategori 25 saja)
    serviceList: [], // layanan perawatan (exclude kategori 25)
    productSellList: [],
    productClinicList: [],
    cageList: []
  });

  // Kondisi pet dari hasil cek dokter
  const [petCondition, setPetCondition] = useState({
    isPregnant: false,
    estimateDateofBirth: null,
    isParent: false,
    isBreastfeeding: false,
    numberofChildren: 0,
    isRecomendInpatient: false
  });

  const [disabledOke, setDisabledOk] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async () => {
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
    const isValid = formValue.stayServiceId && formValue.treatmentPlans.length > 0 && formValue.cage;
    setDisabledOk(!isValid);
  }, [formValue]);

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);

      try {
        // Ambil kondisi pet terlebih dahulu agar bisa filter kandang
        let condition = {
          isPregnant: false,
          isParent: false,
          numberofChildren: 0,
          isRecomendInpatient: false
        };

        try {
          const condResp = await getCheckCondition(data.transactionId);
          if (condResp?.data) {
            condition = condResp.data;
            setPetCondition(condResp.data);
          }
        } catch (_) {
          // Jika endpoint belum tersedia, abaikan dan pakai default
        }

        // Hitung minCapacity: induk + jumlah anak
        const minCapacity = condition.isParent ? (condition.numberofChildren || 0) + 1 : 1;

        const [respTreatmentList, respProductClinicList, respStayService, respService, respProductSellList, respCageList] =
          await Promise.all([
            getTreatmentListByLocation([data.locationId]),
            getProductSellClinicByLocation('clinic', [data.locationId]),
            // Tarif menginap: HANYA kategori 25 (Tarif Menginap Pet Hotel)
            getServiceListByLocation([data.locationId], { categoryId: STAY_SERVICE_CATEGORY_ID }),
            // Service list: semua KECUALI kategori 25
            getServiceListByLocation([data.locationId], { excludeCategoryId: STAY_SERVICE_CATEGORY_ID }),
            getProductSellClinicByLocation('sell', [data.locationId]),
            getCageFacilityLocationList([data.locationId], {
              isPregnant: condition.isPregnant,
              isParent: condition.isParent,
              minCapacity
            })
          ]);

        setFormDropdown((prevState) => ({
          ...prevState,
          treatmentPlanList: respTreatmentList,
          productClinicList: respProductClinicList,
          stayServiceList: respStayService,
          serviceList: respService,
          productSellList: respProductSellList,
          cageList: respCageList
        }));
      } finally {
        loaderGlobalConfig.setLoader(false);
        loaderService.setManualLoader(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Banner kondisi pet ──────────────────────────────────────────────
  const renderConditionBanner = () => {
    if (!petCondition.isPregnant && !petCondition.isParent) return null;

    return (
      <Grid item xs={12}>
        {petCondition.isPregnant && (
          <Alert
            severity="warning"
            sx={{ mb: 1 }}
            action={
              petCondition.estimateDateofBirth && <Chip label={`HPL: ${petCondition.estimateDateofBirth}`} color="warning" size="small" />
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              🐾 Pet Hamil
            </Typography>
            <Typography variant="body2">
              Kandang yang ditampilkan adalah kandang tipe <strong>Maternal</strong> (khusus induk hamil).
              {petCondition.estimateDateofBirth && ` HPL: ${petCondition.estimateDateofBirth}.`}
            </Typography>
          </Alert>
        )}

        {petCondition.isParent && (
          <Alert severity="info" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              🐣 Pet Induk {petCondition.isBreastfeeding ? '(Masih Menyusui)' : ''}
            </Typography>
            <Typography variant="body2">
              Jumlah anak: <strong>{petCondition.numberofChildren || 0}</strong>. Kandang yang ditampilkan memiliki kapasitas minimal{' '}
              <strong>{(petCondition.numberofChildren || 0) + 1}</strong> (induk + anak).
            </Typography>
          </Alert>
        )}
      </Grid>
    );
  };

  // ── Kolom tabel ────────────────────────────────────────────────────
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
          {/* ── Banner kondisi pet (hamil / induk) ── */}
          {renderConditionBanner()}

          {/* ── TARIF MENGINAP (wajib, dipakai saat checkout) ── */}
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Pilih <strong>Tarif Menginap</strong> yang akan digunakan sebagai dasar perhitungan biaya harian saat check-out.
            </Alert>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="stayService" required>
                Tarif Menginap (Harga Per Hari)
              </InputLabel>
              <Autocomplete
                id="stayService"
                name="stayService"
                options={formDropdown.stayServiceList}
                value={formValue.stayService}
                isOptionEqualToValue={(option, val) => val === '' || option.id === val.id}
                onChange={(_, selected) => {
                  setFormValue((prev) => ({
                    ...prev,
                    stayService: selected,
                    stayServiceId: selected ? selected.id : null
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Pilih tarif menginap..."
                    error={!formValue.stayServiceId}
                    helperText={!formValue.stayServiceId ? 'Wajib dipilih untuk kalkulasi checkout' : ''}
                  />
                )}
              />
            </Stack>
          </Grid>

          <Grid item xs={10} md={11}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="treatment-plan-list" required>
                <FormattedMessage id="treatment-plan-list" />
              </InputLabel>
              <Autocomplete
                id="treatmentPlan"
                name="treatmentPlan"
                options={formDropdown.treatmentPlanList}
                value={formValue.treatment}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'treatment', value: selected } })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={formValue.treatmentPlans.length === 0}
                    helperText={formValue.treatmentPlans.length === 0 ? 'Minimal satu rencana perawatan harus ditambahkan' : ''}
                  />
                )}
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

          {/* ── Pilih Kandang — difilter berdasarkan kondisi pet ── */}
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="cage" required>
                <FormattedMessage id="cage" />
                {petCondition.isPregnant && <Chip label="Maternal" color="warning" size="small" sx={{ ml: 1 }} />}
                {petCondition.isParent && !petCondition.isPregnant && (
                  <Chip label="Induk + Anak" color="info" size="small" sx={{ ml: 1 }} />
                )}
              </InputLabel>
              <Autocomplete
                id="cage"
                name="cage"
                options={formDropdown.cageList}
                value={formValue.cage}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => onFieldHandler({ target: { name: 'cage', value: selected } })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder={
                      petCondition.isPregnant
                        ? 'Pilih kandang maternal...'
                        : petCondition.isParent
                        ? `Pilih kandang (min. kap. ${(petCondition.numberofChildren || 0) + 1})...`
                        : 'Pilih kandang...'
                    }
                    error={!formValue.cage}
                    helperText={!formValue.cage ? 'Wajib dipilih' : ''}
                  />
                )}
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
