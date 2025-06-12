import { Box, Grid, InputLabel, Stack, Tab, Tabs } from '@mui/material';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import TransactionDetailAction from 'pages/transaction/detail/action-detail';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { acceptTransactionPetHotel, deleteTransactionPetHotel, getTransactionPetHotelDetail } from '../service';

const TransactionDetail = (props) => {
  const { id } = props.data;
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState({ accept: false, reject: false, delete: false });
  const [data, setData] = useState({ detail: {}, log: [] });
  const [filterLog, setFilterLog] = useState({}); // { dateRange: null }
  const onChangeTab = (value) => setTabSelected(value);
  const dispatch = useDispatch();

  const onCancel = () => props.onClose(false);

  // procedure => accept , cancel
  const onConfirm = async (val, procedure) => {
    if (val) {
      await acceptTransactionPetHotel({
        transactionId: +data.detail.id,
        status: procedure === 'accept' ? 1 : 0,
        reason: procedure === 'cancel' ? val : ''
      })
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarSuccess(`Success ${procedure} patient`));
            props.onClose(`${procedure}-patient`);
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ accept: false, reject: false, delete: false });
    }
  };

  const onDelete = async (val) => {
    if (val) {
      await deleteTransactionPetHotel([id])
        .then((resp) => {
          if (resp.status === 200) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarSuccess(`Success delete data`));
            props.onClose(`delete`);
          }
        })
        .catch((err) => {
          if (err) {
            setDialog({ accept: false, reject: false, delete: false });
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog({ accept: false, reject: false, delete: false });
    }
  };

  const fetchData = async () => {
    const resp = await getTransactionPetHotelDetail({
      id,
      ...filterLog
    });
    const getData = resp.data;
    setData({ detail: getData.detail, log: getData.transactionLogs });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog]);

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transaction" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
        action={{
          element: (
            <TransactionDetailAction
              onAction={(action) => {
                if (action === 'accept-patient') {
                  setDialog({ accept: true, reject: false, delete: false });
                } else if (action === 'cancel-patient') {
                  setDialog({ accept: false, reject: true, delete: false });
                } else if (action === 'delete') {
                  setDialog({ accept: false, reject: false, delete: true });
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
        </Box>
      </ModalC>

      <ConfirmationC
        open={dialog.delete}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onDelete(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />

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
  onClose: PropTypes.func
};

export default TransactionDetail;
