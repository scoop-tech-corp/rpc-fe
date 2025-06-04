import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Grid, InputLabel, Stack, Tab, Tabs } from '@mui/material';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import TabPanel from 'components/TabPanelC';
import PropTypes from 'prop-types';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import LogActivityDetailTransaction from 'pages/transaction/detail/log-activity';
import { ReactTable } from 'components/third-party/ReactTable';
import { formatThousandSeparator } from 'utils/func';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';

const TransactionDetailPetShop = (props) => {
  const { id } = props.data;
  const [tabSelected, setTabSelected] = useState(0);
  const [dialog, setDialog] = useState({ accept: false, reject: false });
  const [data, setData] = useState({ detail: {}, log: [] });
  const [filterLog, setFilterLog] = useState({}); // { dateRange: null }
  const [confirmPaymentDialog, setConfirmPaymentDialog] = useState({ open: false });
  const [file, setFile] = useState(null);
  const [productsDetail, setProductsDetail] = useState([
    {
      item_name: 'whiskas',
      category: 'Product Sell',
      quantity: 2,
      bonus: 1,
      discount: 0,
      unit_price: 25000,
      total: 50000,
      note: ''
    },
    {
      item_name: 'Bundling Package: Lifecat & Purina',
      category: '',
      quantity: 1,
      bonus: 0,
      discount: 0,
      total: 100000,
      note: '',
      included_items: [
        {
          name: 'Lifecat',
          normal_price: 80000
        },
        {
          name: 'Purina',
          normal_price: 60000
        }
      ]
    },
    {
      item_name: 'Cat Litter',
      category: 'Product Sell',
      quantity: 1,
      bonus: 0,
      discount: 10,
      unit_price: 25000,
      total: 22500,
      note: '10% discount (save Rp2,500)'
    },
    {
      item_name: 'Cat Shampoo',
      category: 'Product Sell',
      quantity: 2,
      bonus: 0,
      discount: 0,
      unit_price: 25000,
      total: 50000,
      note: ''
    }
  ]);
  const onChangeTab = (value) => setTabSelected(value);
  const dispatch = useDispatch();

  const onCancel = () => props.onClose(false);

  // procedure => accept , cancel
  const onConfirm = async (val, procedure) => {
    if (val) {
      // await acceptTransaction({
      //   transactionId: +data.detail.id,
      //   status: procedure === 'accept' ? 1 : 0,
      //   reason: procedure === 'cancel' ? val : ''
      // })
      //   .then((resp) => {
      //     if (resp.status === 200) {
      //       setDialog({ accept: false, reject: false });
      //       dispatch(snackbarSuccess(`Success ${procedure} patient`));
      //       props.onClose(`${procedure}-patient`);
      //     }
      //   })
      //   .catch((err) => {
      //     if (err) {
      //       setDialog({ accept: false, reject: false });
      //       dispatch(snackbarError(createMessageBackend(err)));
      //     }
      //   });
    } else {
      setDialog({ accept: false, reject: false });
    }
  };

  const fetchData = async () => {
    // const resp = await getTransactionDetail({
    //   id,
    //   ...filterLog
    // });
    // const getData = resp.data;
    // setData({ detail: getData.detail, log: getData.transactionLogs });
    setData({
      detail: {
        isNewCustomer: true,
        locationName: 'RPC Condet',
        customerName: 'John Doe',
        paymentMethod: 'Debit',
        createdBy: 'Agus',
        createdAt: '20/11/2025 11:00:00',
        notes: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, recusandae.',
        proofOfPayment: 'https://picsum.photos/id/870/200/300?grayscale&blur=2'
      },
      log: []
    });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLog]);

  const summaryColumns = useMemo(
    () => [
      {
        Header: 'No.',
        accessor: (_, index) => index + 1, // nomor urut dimulai dari 1
        id: 'rowNumber',
        isNotSorting: true,
        Cell: ({ row }) => row.index + 1
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'item_name',
        Cell: (data) => {
          const bundleIncludedItems = data.row.original?.included_items || [];

          return (
            <div>
              <p>{data.value}</p>
              {bundleIncludedItems.length > 0 && (
                <>
                  {bundleIncludedItems.map((item, index) => (
                    <p key={item.name + index}>
                      {item.name} (harga normal Rp {formatThousandSeparator(item.normal_price)})
                    </p>
                  ))}
                </>
              )}
            </div>
          );
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="bonus" />, accessor: 'bonus', isNotSorting: true },
      { Header: <FormattedMessage id="discount" />, accessor: 'discount', Cell: (data) => `${data.value}%`, isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unit_price',
        Cell: (data) => {
          const unitPrice = data?.value || data.row.original.total;

          return 'Rp ' + formatThousandSeparator(unitPrice || 0);
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'total',
        Cell: (data) => 'Rp ' + formatThousandSeparator(data.value),
        isNotSorting: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

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
            // <TransactionDetailAction
            //   onAction={(action) => {
            //     if (action === 'accept-patient') {
            //       setDialog({ accept: true, reject: false });
            //     } else if (action === 'cancel-patient') {
            //       setDialog({ accept: false, reject: true });
            //     } else {
            //       props.onClose(action);
            //     }
            //   }}
            // />
            <Stack direction="row" gap={1} marginLeft="auto">
              <Button variant="contained" aria-controls={props.open ? 'quick-access' : undefined} aria-haspopup="true" onClick={() => {}}>
                <FormattedMessage id="edit" />
              </Button>
              <Button variant="contained" aria-controls={props.open ? 'quick-access' : undefined} aria-haspopup="true" onClick={() => {}}>
                <FormattedMessage id="print-invoice" />
              </Button>
              <Button
                variant="contained"
                aria-controls={props.open ? 'quick-access' : undefined}
                aria-haspopup="true"
                onClick={() => {
                  setConfirmPaymentDialog({ open: true });
                }}
              >
                <FormattedMessage id="confirm-payment" />
              </Button>
              <Button
                variant="contained"
                color="error"
                aria-controls={props.open ? 'quick-access' : undefined}
                aria-haspopup="true"
                onClick={() => {}}
              >
                <FormattedMessage id="delete" />
              </Button>
            </Stack>
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
                    <FormattedMessage id="created-by" />
                  </InputLabel>
                  {data.detail.createdBy || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="location" />
                  </InputLabel>
                  {data.detail.locationName || '-'}
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
                    <FormattedMessage id="customer-name" />
                  </InputLabel>
                  {data.detail.customerName || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="notes" />
                  </InputLabel>
                  {data.detail.notes || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="payment-method" />
                  </InputLabel>
                  {data.detail.paymentMethod || '-'}
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={6}></Grid>

              <Grid item xs={12} sm={6} md={6}>
                <Stack spacing={1}>
                  <InputLabel>
                    <FormattedMessage id="proof-of-payment" />
                  </InputLabel>
                  <div>
                    {data.detail?.proofOfPayment ? (
                      <img width={100} height={150} src={data.detail.proofOfPayment} alt="proof-of-payment" />
                    ) : (
                      <FormattedMessage id="no-proof-of-payment-yet" />
                    )}
                  </div>
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={2} marginTop={4}>
              <h3>
                <FormattedMessage id="products" />{' '}
              </h3>
              <ReactTable columns={summaryColumns} data={productsDetail} />
            </Stack>
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

      <ModalC
        title={<FormattedMessage id="confirm-payment" />}
        open={confirmPaymentDialog.open}
        // onOk={onSubmitPromo}
        onCancel={() => setConfirmPaymentDialog({ open: false })}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="upload-image" />
          </InputLabel>
          <SingleFileUpload
            file={file}
            setFieldValue={(name, value) => {
              setFile(value);
            }}
          />
        </Stack>
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

TransactionDetailPetShop.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default TransactionDetailPetShop;
