import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import { getTreatmentListByLocation } from 'pages/service/treatment/service';
import { getServiceListByLocation, createMessageBackend } from 'service/service-global';
import { ReactTable } from 'components/third-party/ReactTable';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import IconButton from 'components/@extended/IconButton';
import { storeTreatmentPlanPetClinic } from '../../service';

const TreatmentPetClinic = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState({
    transactionId: data.transactionId,
    treatment: null,
    service: null,
    qtyService: '',
    treatmentPlans: [],
    services: [],
    estimatedDays: 1,
    note: ''
  });

  const [formDropdown, setFormDropdown] = useState({
    treatmentPlanList: [],
    serviceList: []
  });

  const [disabledOk, setDisabledOk] = useState(false);

  useEffect(() => {
    const isValid = formValue.treatmentPlans.length > 0 && formValue.estimatedDays >= 1;
    setDisabledOk(!isValid);
  }, [formValue]);

  useEffect(() => {
    const fetchData = async () => {
      loaderService.setManualLoader(true);
      loaderGlobalConfig.setLoader(true);
      try {
        const [respTreatmentList, respServiceList] = await Promise.all([
          getTreatmentListByLocation([data.locationId]),
          getServiceListByLocation([data.locationId])
        ]);
        setFormDropdown({ treatmentPlanList: respTreatmentList, serviceList: respServiceList });
      } finally {
        loaderGlobalConfig.setLoader(false);
        loaderService.setManualLoader(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async () => {
    await storeTreatmentPlanPetClinic({
      transactionId: formValue.transactionId,
      treatmentPlans: formValue.treatmentPlans,
      services: formValue.services,
      products: [],
      estimatedDays: formValue.estimatedDays,
      note: formValue.note
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess('Treatment plan berhasil disimpan'));
          props.onClose(true);
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onCancel = () => props.onClose(false);

  const onFieldHandler = (event) => setFormValue((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prev) => {
      const list = [...prev[procedure]];
      list.splice(rowIndex, 1);
      return { ...prev, [procedure]: list };
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

  return (
    <ModalC
      title={<FormattedMessage id="input-treatment-plan-inpatient" />}
      open={props.open}
      onOk={onSubmit}
      disabledOk={disabledOk}
      onCancel={onCancel}
      fullWidth
      maxWidth="sm"
    >
      <Grid container spacing={3}>
        {/* Estimated Days */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="estimatedDays" required>
              Estimasi Hari Rawat Inap
            </InputLabel>
            <TextField
              fullWidth
              type="number"
              id="estimatedDays"
              name="estimatedDays"
              value={formValue.estimatedDays}
              inputProps={{ min: 1 }}
              onChange={onFieldHandler}
            />
          </Stack>
        </Grid>

        {/* Note */}
        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="note">Catatan Dokter</InputLabel>
            <TextField
              fullWidth
              multiline
              rows={2}
              id="note"
              name="note"
              value={formValue.note}
              onChange={onFieldHandler}
              placeholder="Catatan tambahan dari dokter (opsional)"
            />
          </Stack>
        </Grid>

        {/* Treatment Plan selector */}
        <Grid item xs={10} md={11}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="treatment" required>
              <FormattedMessage id="treatment-plan-list" />
            </InputLabel>
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

        {/* Service selector */}
        <Grid item xs={12} md={6}>
          <Stack spacing={1.25}>
            <InputLabel htmlFor="service">Layanan Tambahan</InputLabel>
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
                services: [
                  // gunakan prev.service.id (numeric) bukan .value (fullName string)
                  ...prev.services,
                  { id: prev.service.id, name: prev.service.label, quantity: +prev.qtyService }
                ]
              }));
            }}
          >
            <PlusOutlined />
          </IconButton>
        </Grid>

        {/* Summary tables */}
        <Grid item xs={12}>
          <InputLabel style={{ fontWeight: 'bold' }}>
            <FormattedMessage id="summary" />
          </InputLabel>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel>
              <FormattedMessage id="treatment-plan" />
            </InputLabel>
            <ReactTable columns={columnsTreatmentPlan} data={formValue.treatmentPlans} />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1.25}>
            <InputLabel>
              <FormattedMessage id="service" />
            </InputLabel>
            <ReactTable columns={columnsService} data={formValue.services} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

TreatmentPetClinic.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TreatmentPetClinic;
