import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getTreatmentListByLocation } from 'pages/service/treatment/service';
import { getServiceListByLocation, getProductSellClinicByLocation, createMessageBackend } from 'service/service-global';
import { ReactTable } from 'components/third-party/ReactTable';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import { submitTreatmentPetSalon } from '../../service';

const TreatmentPetSalon = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState({
    transactionId: data.transactionId,
    treatment: null,
    service: null,
    qtyService: '',
    product: null,
    qtyProduct: '',
    treatmentPlans: [],
    services: [],
    productSells: []
  });

  const [formDropdown, setFormDropdown] = useState({
    treatmentPlanList: [],
    serviceList: [],
    productList: []
  });

  const [disabledOk, setDisabledOk] = useState(false);

  // Minimal satu item dari salah satu kategori
  useEffect(() => {
    const hasItem = formValue.treatmentPlans.length > 0 || formValue.services.length > 0 || formValue.productSells.length > 0;
    setDisabledOk(!hasItem);
  }, [formValue]);

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);
      try {
        const [respTreatmentList, respServiceList, respProductList] = await Promise.all([
          getTreatmentListByLocation([data.locationId]),
          getServiceListByLocation([data.locationId]),
          getProductSellClinicByLocation('sell', [data.locationId])
        ]);
        setFormDropdown({
          treatmentPlanList: respTreatmentList,
          serviceList: respServiceList,
          productList: respProductList
        });
      } finally {
        loaderGlobalConfig.setLoader(false);
        loaderService.setManualLoader(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    await submitTreatmentPetSalon({
      transactionId: formValue.transactionId,
      treatmentPlans: formValue.treatmentPlans,
      services: formValue.services,
      productSells: formValue.productSells
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Treatment berhasil disimpan'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(false);

  const onFieldHandler = (event) => setFormValue((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onDeleteRowHandler = (listKey, rowIndex) => {
    setFormValue((prev) => {
      const list = [...prev[listKey]];
      list.splice(rowIndex, 1);
      return { ...prev, [listKey]: list };
    });
  };

  const columnsTreatmentPlan = useMemo(
    () => [
      { Header: <FormattedMessage id="treatment-name" />, accessor: 'name', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (cellData) => (
          <IconButton size="medium" color="error" onClick={() => onDeleteRowHandler('treatmentPlans', cellData.row.index)}>
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const columnsService = useMemo(
    () => [
      { Header: <FormattedMessage id="service-name" />, accessor: 'name', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (cellData) => (
          <IconButton size="medium" color="error" onClick={() => onDeleteRowHandler('services', cellData.row.index)}>
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const columnsProduct = useMemo(
    () => [
      { Header: <FormattedMessage id="product-name" />, accessor: 'name', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (cellData) => (
          <IconButton size="medium" color="error" onClick={() => onDeleteRowHandler('productSells', cellData.row.index)}>
            <DeleteFilled />
          </IconButton>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <ModalC
      title={<FormattedMessage id="input-treatment-salon" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      fullWidth
      maxWidth="sm"
    >
      <Grid container spacing={3}>
        {/* ── Treatment Plan ── */}
        <Grid item xs={10} md={11}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="treatment">Treatment Plan</InputLabel>
            <TextField
              select
              SelectProps={{ native: true }}
              fullWidth
              id="treatment"
              name="treatment"
              value={formValue.treatment ? formValue.treatment.value : ''}
              onChange={(e) => {
                const selected = formDropdown.treatmentPlanList.find((t) => String(t.value) === e.target.value);
                setFormValue((prev) => ({ ...prev, treatment: selected ?? null }));
              }}
            >
              <option value="">-- Pilih Treatment Plan --</option>
              {formDropdown.treatmentPlanList.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </TextField>
          </Stack>
        </Grid>
        <Grid item xs={2} md={1} display="flex" alignItems="flex-end" justifyContent="center">
          <IconButton
            size="medium"
            color="primary"
            disabled={!formValue.treatment}
            onClick={() => {
              setFormValue((prev) => ({
                ...prev,
                treatment: null,
                treatmentPlans: [...prev.treatmentPlans, { id: prev.treatment.value, name: prev.treatment.label }]
              }));
            }}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>

        {/* ── Layanan ── */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="service">Layanan / Service</InputLabel>
            <TextField
              select
              SelectProps={{ native: true }}
              fullWidth
              id="service"
              name="service"
              value={formValue.service ? formValue.service.id : ''}
              onChange={(e) => {
                const selected = formDropdown.serviceList.find((s) => String(s.id) === e.target.value);
                setFormValue((prev) => ({ ...prev, service: selected ?? null }));
              }}
            >
              <option value="">-- Pilih Layanan --</option>
              {formDropdown.serviceList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </TextField>
          </Stack>
        </Grid>
        <Grid item xs={10} md={5}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="qtyService">
              <FormattedMessage id="quantity" />
            </InputLabel>
            <TextField fullWidth type="number" id="qtyService" name="qtyService" value={formValue.qtyService} onChange={onFieldHandler} />
          </Stack>
        </Grid>
        <Grid item xs={2} md={1} display="flex" alignItems="flex-end" justifyContent="center">
          <IconButton
            size="medium"
            color="primary"
            disabled={!formValue.service || !formValue.qtyService}
            onClick={() => {
              setFormValue((prev) => ({
                ...prev,
                service: null,
                qtyService: '',
                services: [...prev.services, { id: prev.service.id, name: prev.service.label, quantity: +prev.qtyService }]
              }));
            }}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>

        {/* ── Produk ── */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="product">Produk</InputLabel>
            <TextField
              select
              SelectProps={{ native: true }}
              fullWidth
              id="product"
              name="product"
              value={formValue.product ? formValue.product.id : ''}
              onChange={(e) => {
                const selected = formDropdown.productList.find((p) => String(p.id) === e.target.value);
                setFormValue((prev) => ({ ...prev, product: selected ?? null }));
              }}
            >
              <option value="">-- Pilih Produk --</option>
              {formDropdown.productList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </TextField>
          </Stack>
        </Grid>
        <Grid item xs={10} md={5}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="qtyProduct">
              <FormattedMessage id="quantity" />
            </InputLabel>
            <TextField fullWidth type="number" id="qtyProduct" name="qtyProduct" value={formValue.qtyProduct} onChange={onFieldHandler} />
          </Stack>
        </Grid>
        <Grid item xs={2} md={1} display="flex" alignItems="flex-end" justifyContent="center">
          <IconButton
            size="medium"
            color="primary"
            disabled={!formValue.product || !formValue.qtyProduct}
            onClick={() => {
              setFormValue((prev) => ({
                ...prev,
                product: null,
                qtyProduct: '',
                productSells: [...prev.productSells, { id: prev.product.id, name: prev.product.label, quantity: +prev.qtyProduct }]
              }));
            }}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>

        {/* ── Summary Tables ── */}
        {formValue.treatmentPlans.length > 0 && (
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>Treatment Plan</InputLabel>
              <ReactTable columns={columnsTreatmentPlan} data={formValue.treatmentPlans} />
            </Stack>
          </Grid>
        )}

        {formValue.services.length > 0 && (
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="service" />
              </InputLabel>
              <ReactTable columns={columnsService} data={formValue.services} />
            </Stack>
          </Grid>
        )}

        {formValue.productSells.length > 0 && (
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel>
                <FormattedMessage id="product" />
              </InputLabel>
              <ReactTable columns={columnsProduct} data={formValue.productSells} />
            </Stack>
          </Grid>
        )}
      </Grid>
    </ModalC>
  );
};

TreatmentPetSalon.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TreatmentPetSalon;
