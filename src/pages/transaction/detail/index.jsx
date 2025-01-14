import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Grid, InputLabel, Stack, Tab, Tabs } from '@mui/material';
import { getTransactionDetail } from '../service';

import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import PropTypes from 'prop-types';
import TransactionDetailAction from './action-detail';
import LogActivityDetailTransaction from './log-activity';

const TransactionDetail = (props) => {
  const { id } = props.data;
  const [tabSelected, setTabSelected] = useState(0);
  const [data, setData] = useState({ detail: {}, log: [] });
  const [filterLog, setFilterLog] = useState({}); // { dateRange: null }
  const onChangeTab = (value) => setTabSelected(value);

  const onCancel = () => props.onClose(false);

  const fetchData = async () => {
    const resp = await getTransactionDetail({
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
                props.onClose(action);
              }}
              // id={props.id}
              // status={dataDetail.productBundle?.status}
              // getDetail={getDetail}
              // onRefreshIndex={(e) => props.onRefreshIndex(e)}
              // onCancelDetail={() => {
              //   props.onClose({ isClose: true, isCloseWithHitIndex: true });
              //   setTabSelected(0);
              // }}
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
              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="type-category" />
                  </InputLabel>
                  {data.detail.serviceCategory}
                </Stack>
              </Grid>

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
    </>
  );
};

TransactionDetail.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetail;
