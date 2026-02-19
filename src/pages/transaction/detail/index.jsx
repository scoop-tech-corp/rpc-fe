import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Grid, InputLabel, Stack, Tab, Tabs } from '@mui/material';
import { acceptTransaction, getTransactionDetail } from '../service';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { getTransactionPetHotelDetail } from '../pages/pet-hotel/service';
import { getTransactionPetClinicDetail } from '../pages/pet-clinic/service';

import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import PropTypes from 'prop-types';
import TransactionDetailAction from './action-detail';
import LogActivityDetailTransaction from './log-activity';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import LogPaymentDetailTransaction from './log-payment';
import useAuth from 'hooks/useAuth';

const TransactionDetail = (props) => {
  const { id } = props.data;
  const { type } = props;
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState({ accept: false, reject: false });
  const [data, setData] = useState({
    detail: {},
    log: [],
    paymentLogs: []
  });
  const [filterLog, setFilterLog] = useState({}); // { dateRange: null }
  const [filterLogPayment, setFilterLogPayment] = useState({}); // { dateRange: null }
  const onChangeTab = (value) => setTabSelected(value);
  const dispatch = useDispatch();
  const { user } = useAuth();

  const onCancel = () => props.onClose(false);

  // procedure => accept , cancel
  const onConfirm = async (val, procedure) => {
    if (val) {
      await acceptTransaction({
        transactionId: +data.detail.id,
        status: procedure === 'accept' ? 1 : 0,
        reason: procedure === 'cancel' ? val : ''
      })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ accept: false, reject: false });
            dispatch(snackbarSuccess(`Success ${procedure} patient`));
            props.onClose(`${procedure}-patient`);
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ accept: false, reject: false });
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ accept: false, reject: false });
    }
  };

  const fetchData = async () => {
    let apiGetDetail = getTransactionDetail;
    let payload = {
      id,
      ...filterLog
    };

    if (type === 'pet-hotel') {
      apiGetDetail = getTransactionPetHotelDetail;
    }

    if (type === 'pet-clinic') {
      apiGetDetail = getTransactionPetClinicDetail;
      payload = {
        ...payload,
        ...filterLogPayment
      };
    }

    const resp = await apiGetDetail(payload);
    const getData = resp.data;
    const fetching = { detail: getData.detail, log: getData.transactionLogs, paymentLogs: [] };

    if (type === 'pet-clinic') {
      fetching.paymentLogs = getData.paymentLogs;
    }

    setData(fetching);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog]);

  useEffect(() => {
    if (type === 'pet-clinic') {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLogPayment]);

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transaction" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="lg"
        action={{
          element:
            type === 'pet-clinic' ? (
              <Stack direction="row" gap={1} marginLeft="auto">
                {[
                  'menunggu dokter',
                  'cek kondisi pet',
                  'ditolak dokter',
                  'input service dan obat',
                  'proses pembayaran',
                  'menunggu konfirmasi pembayaran',
                  'selesai'
                ].includes(data?.detail?.status?.toLowerCase()) &&
                  ['kasir', 'komisaris', 'president director', 'director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" onClick={() => props.onClose('edit')}>
                      <FormattedMessage id="edit" />
                    </Button>
                  )}

                {['menunggu dokter'].includes(data?.detail?.status?.toLowerCase()) &&
                  ['dokter hewan', 'komisaris', 'president director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="info" onClick={() => setDialog({ accept: true, reject: false })}>
                      <FormattedMessage id="accept-patient" />
                    </Button>
                  )}

                {['menunggu dokter', 'cek kondisi pet', 'ditolak dokter'].includes(data?.detail?.status?.toLowerCase()) &&
                  ['kasir', 'dokter hewan', 'komisaris', 'president director', 'director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="secondary" onClick={() => setDialog({ accept: false, reject: true })}>
                      <FormattedMessage id="cancel-patient" />
                    </Button>
                  )}

                {[
                  'menunggu dokter',
                  'cek kondisi pet',
                  'ditolak dokter',
                  'input service dan obat',
                  'proses pembayaran',
                  'menunggu konfirmasi pembayaran',
                  'selesai'
                ].includes(data?.detail?.status?.toLowerCase()) &&
                  ['komisaris', 'president director', 'director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="error" onClick={() => props.onClose('delete')}>
                      <FormattedMessage id="delete-transaction" />
                    </Button>
                  )}

                {data?.detail?.status?.toLowerCase() === 'cek kondisi pet' &&
                  ['dokter hewan', 'president director', 'director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="success" onClick={() => props.onClose('check-pet-condition')}>
                      <FormattedMessage id="check-pet-condition" />
                    </Button>
                  )}

                {data?.detail?.status?.toLowerCase() === 'input service dan obat' &&
                  ['komisaris', 'president director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="success" onClick={() => props.onClose('service-and-recipe')}>
                      <FormattedMessage id="service-and-recipe" />
                    </Button>
                  )}

                {data?.detail?.status?.toLowerCase() === 'proses pembayaran' &&
                  ['kasir', 'komisaris', 'president director'].includes(user?.jobName?.toLowerCase()) && (
                    <Button variant="contained" color="success" onClick={() => props.onClose('payment')}>
                      <FormattedMessage id="payment" />
                    </Button>
                  )}
              </Stack>
            ) : (
              <TransactionDetailAction
                onAction={(action) => {
                  if (action === 'accept-patient') {
                    setDialog({ accept: true, reject: false });
                  } else if (action === 'cancel-patient') {
                    setDialog({ accept: false, reject: true });
                  } else {
                    props.onClose(action);
                  }
                }}
              />
            ),
          justifyContent: 'flex-start',
          alignItems: 'center'
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={tabSelected}
            onChange={(_, value) => onChangeTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="detail transaction tab"
          >
            <Tab label={<FormattedMessage id="details" />} id="detail-transaction-tab-0" aria-controls="detail-transaction-tabpanel-0" />
            <Tab
              label={<FormattedMessage id="log-activity" />}
              id="detail-transaction-tab-1"
              aria-controls="detail-transaction-tabpanel-1"
            />
            {type === 'pet-clinic' && (
              <Tab
                label={<FormattedMessage id="log-payment" />}
                id="detail-transaction-tab-2"
                aria-controls="detail-transaction-tabpanel-2"
              />
            )}
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <TabPanel value={tabSelected} index={0} name="detail-transaction">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="customer" />
                  </InputLabel>
                  {+data.detail.isNewCustomer ? <FormattedMessage id="customer-new" /> : <FormattedMessage id="customer-old" />}
                </Stack>
              </Grid>

              {data?.detail?.serviceCategory && (
                <Grid item xs={12} sm={6} md={6}>
                  <Stack spacing={1}>
                    <InputLabel>
                      <FormattedMessage id="type-category" />
                    </InputLabel>
                    {data.detail.serviceCategory}
                  </Stack>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  {data.detail.locationName}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="start-date" />
                  </InputLabel>
                  {data.detail.startDate || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="customer-name" />
                  </InputLabel>
                  {data.detail.customerName || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="end-date" />
                  </InputLabel>
                  {data.detail.endDate || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="registrant-name" />
                  </InputLabel>
                  {data.detail.registrant || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="treating-doctor" />
                  </InputLabel>
                  {data.detail.picDoctor || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="pets" />
                  </InputLabel>
                  {data.detail.petName || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="created-at" />
                  </InputLabel>
                  {data.detail.createdAt || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="notes" />
                  </InputLabel>
                  {data.detail.note || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="created-by" />
                  </InputLabel>
                  {data.detail.createdBy || '-'}
                </Stack>
              </Grid>
            </Grid>
          </TabPanel>
          <TabPanel value={tabSelected} index={1} name="detail-transaction">
            <LogActivityDetailTransaction
              data={data.log}
              onFetchData={(e) => {
                if (e) setFilterLog(e);
              }}
            />
          </TabPanel>
          {type === 'pet-clinic' && (
            <TabPanel value={tabSelected} index={2} name="detail-transaction">
              <LogPaymentDetailTransaction
                data={data.paymentLogs}
                onFetchData={(e) => {
                  if (e) setFilterLogPayment(e);
                }}
              />
            </TabPanel>
          )}
        </Box>
      </ModalC>
      <ConfirmationC
        open={dialog.accept}
        title={<FormattedMessage id="accept-patient" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-this-patient" />}
        onClose={(response) => onConfirm(response, 'accept')}
        btnTrueText="Ok"
      />
      <FormReject
        open={dialog.reject}
        title={<FormattedMessage id="confirm-and-please-fill-in-the-reasons-for-cancel-this-patient" />}
        onSubmit={(response) => onConfirm(response, 'cancel')}
        onClose={() => setDialog({ accept: false, reject: false })}
      />
    </>
  );
};

TransactionDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func,
  type: PropTypes.string
};

export default TransactionDetail;
