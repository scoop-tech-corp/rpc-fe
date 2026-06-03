import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Autocomplete,
  Button,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import DownloadIcon from '@mui/icons-material/Download';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import {
  getDeliveryOrderDetail,
  getDeliveryAgentDropdown,
  assignDeliveryOrder,
  pickupDeliveryOrder,
  startDeliveryOrder,
  completeDeliveryOrder,
  failedDeliveryOrder,
  cancelDeliveryOrder,
  downloadDeliveryOrderPdf
} from './service';
import { ReactTable } from 'components/third-party/ReactTable';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';

import ModalC from 'components/ModalC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import PropTypes from 'prop-types';

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'warning' },
  assigned: { label: 'Assigned', color: 'info' },
  picked_up: { label: 'Picked Up', color: 'secondary' },
  on_delivery: { label: 'On Delivery', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' }
};

const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="h6" fontWeight="bold">{label}</Typography>
    <Typography variant="body1">{value ?? '-'}</Typography>
  </Grid>
);

DetailItem.propTypes = { label: PropTypes.node, value: PropTypes.any };

const OrderDetail = ({ open, id, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [agentList, setAgentList] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const [confirmAssign, setConfirmAssign] = useState(false);
  const [confirmPickup, setConfirmPickup] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);
  const [confirmFail, setConfirmFail] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [failedReason, setFailedReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const status = STATUS_MAP[data?.status] ?? { label: '-', color: 'default' };

  const columnItems = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: 'SKU', accessor: 'sku', isNotSorting: true },
      { Header: <FormattedMessage id="product" defaultMessage="Product" />, accessor: 'productName', isNotSorting: true },
      { Header: <FormattedMessage id="type" defaultMessage="Type" />, accessor: 'productType', isNotSorting: true },
      { Header: <FormattedMessage id="quantity" defaultMessage="Qty" />, accessor: 'qty', isNotSorting: true },
      { Header: <FormattedMessage id="unit-price" defaultMessage="Unit Price" />, accessor: 'unitPrice', isNotSorting: true },
      { Header: 'Subtotal', accessor: 'subtotal', isNotSorting: true }
    ],
    []
  );

  const columnLogs = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: <FormattedMessage id="action" defaultMessage="Action" />, accessor: 'action', isNotSorting: true },
      {
        Header: <FormattedMessage id="description" defaultMessage="Description" />,
        accessor: 'description',
        isNotSorting: true
      },
      { Header: <FormattedMessage id="performed-by" defaultMessage="Performed By" />, accessor: 'userName', isNotSorting: true },
      { Header: <FormattedMessage id="created-at" defaultMessage="Created At" />, accessor: 'created_at', isNotSorting: true }
    ],
    []
  );

  const fetchDetail = async () => {
    await getDeliveryOrderDetail(id)
      .then((resp) => setData(resp.data))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const fetchAgents = async (locationId) => {
    await getDeliveryAgentDropdown(locationId)
      .then((resp) => setAgentList(resp.data.map((a) => ({ label: `${a.name} (${a.vehiclePlate ?? '-'})`, value: a.id }))))
      .catch(() => {});
  };

  useEffect(() => {
    if (open && id) fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id]);

  useEffect(() => {
    if (data?.locationId && data?.status === 'draft') fetchAgents(data.locationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const handleAction = async (action) => {
    const close = () => {
      setConfirmAssign(false);
      setConfirmPickup(false);
      setConfirmStart(false);
      setConfirmComplete(false);
      setConfirmFail(false);
      setConfirmCancel(false);
    };

    const requests = {
      assign: () => assignDeliveryOrder({ id, agentId: selectedAgent?.value }),
      pickup: () => pickupDeliveryOrder(id),
      start: () => startDeliveryOrder(id),
      complete: () => completeDeliveryOrder({ id }),
      fail: () => failedDeliveryOrder({ id, failedReason }),
      cancel: () => cancelDeliveryOrder({ id, cancelledReason: cancelReason })
    };

    await requests[action]()
      .then((resp) => {
        if (resp.status === 200) {
          close();
          dispatch(snackbarSuccess(resp.data?.message ?? 'Success'));
          onSuccess();
          fetchDetail();
        }
      })
      .catch((err) => {
        if (err) {
          close();
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const isDraft = data?.status === 'draft';
  const isAssigned = data?.status === 'assigned';
  const isPickedUp = data?.status === 'picked_up';
  const isOnDelivery = data?.status === 'on_delivery';
  const canDownloadPdf = ['delivered', 'failed', 'cancelled'].includes(data?.status);

  const onDownloadPdf = async () => {
    await downloadDeliveryOrderPdf(id)
      .then((resp) => processDownloadPDF(resp, `delivery-order-${data?.deliveryNumber ?? id}`))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  return (
    <>
      <ModalC
        open={open}
        title={
          <FormattedMessage id="detail-delivery-order" defaultMessage="Delivery Order Detail" />
        }
        onCancel={onClose}
        isModalAction={false}
        fullWidth
        maxWidth="md"
        action={{
          element: (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {isDraft && (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={() => navigate(`/product/delivery-agent/order/form/${id}`)}
                  >
                    <FormattedMessage id="edit" defaultMessage="Edit" />
                  </Button>
                  <Button size="small" variant="contained" color="info" onClick={() => setConfirmAssign(true)} disabled={!selectedAgent}>
                    <FormattedMessage id="assign-agent" defaultMessage="Assign Agent" />
                  </Button>
                </>
              )}
              {isAssigned && (
                <>
                  <Button size="small" variant="contained" color="secondary" onClick={() => setConfirmPickup(true)}>
                    <FormattedMessage id="pickup" defaultMessage="Pickup" />
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => setConfirmCancel(true)}>
                    <FormattedMessage id="cancel" defaultMessage="Cancel" />
                  </Button>
                </>
              )}
              {isPickedUp && (
                <Button size="small" variant="contained" color="primary" onClick={() => setConfirmStart(true)}>
                  <FormattedMessage id="start-delivery" defaultMessage="Start Delivery" />
                </Button>
              )}
              {isOnDelivery && (
                <>
                  <Button size="small" variant="contained" color="success" onClick={() => setConfirmComplete(true)}>
                    <FormattedMessage id="complete" defaultMessage="Complete" />
                  </Button>
                  <Button size="small" variant="contained" color="error" onClick={() => setConfirmFail(true)}>
                    <FormattedMessage id="failed" defaultMessage="Failed" />
                  </Button>
                </>
              )}
              {canDownloadPdf && (
                <Button size="small" variant="outlined" color="primary" startIcon={<DownloadIcon />} onClick={onDownloadPdf}>
                  <FormattedMessage id="download-pdf" defaultMessage="Download PDF" />
                </Button>
              )}
            </Stack>
          ),
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="information" defaultMessage="Information" />}>
              <Grid container spacing={2}>
                <DetailItem label="DO Number" value={data?.deliveryNumber} />
                <DetailItem
                  label={<FormattedMessage id="location" defaultMessage="Location" />}
                  value={data?.location?.locationName}
                />
                <DetailItem
                  label={<FormattedMessage id="customer" defaultMessage="Customer" />}
                  value={data?.customerName}
                />
                <DetailItem
                  label={<FormattedMessage id="phone" defaultMessage="Phone" />}
                  value={data?.customerPhone}
                />
                <DetailItem
                  label={<FormattedMessage id="delivery-address" defaultMessage="Delivery Address" />}
                  value={data?.deliveryAddress}
                />
                <DetailItem
                  label={<FormattedMessage id="delivery-date" defaultMessage="Delivery Date" />}
                  value={data?.deliveryDate}
                />
                <DetailItem
                  label={<FormattedMessage id="agent" defaultMessage="Agent" />}
                  value={data?.agent ? `${data.agent.name} (${data.agent.vehiclePlate ?? '-'})` : '-'}
                />
                <DetailItem
                  label={<FormattedMessage id="created-by" defaultMessage="Created By" />}
                  value={data?.creator?.name}
                />
                <DetailItem label={<FormattedMessage id="note" defaultMessage="Note" />} value={data?.note} />
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="h6" fontWeight="bold">Status</Typography>
                  <Chip color={status.color} label={status.label} size="small" variant="light" />
                </Grid>
              </Grid>

              {isDraft && (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={agentList}
                      value={selectedAgent}
                      isOptionEqualToValue={(opt, val) => opt.value === val.value}
                      onChange={(_, val) => setSelectedAgent(val)}
                      noOptionsText={<FormattedMessage id="no-options" defaultMessage="No agents available" />}
                      renderInput={(params) => <TextField {...params} label={<FormattedMessage id="select-agent" />} size="small" />}
                    />
                  </Grid>
                </Grid>
              )}
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="items" defaultMessage="Items" />}>
              <ScrollX>
                <ReactTable columns={columnItems} data={data?.details ?? []} />
              </ScrollX>
            </MainCard>
          </Grid>

          {data?.logs?.length > 0 && (
            <Grid item xs={12}>
              <MainCard title={<FormattedMessage id="log" defaultMessage="Log" />}>
                <ScrollX>
                  <ReactTable columns={columnLogs} data={data.logs} />
                </ScrollX>
              </MainCard>
            </Grid>
          )}
        </Grid>
      </ModalC>

      {confirmAssign && (
        <ConfirmationC
          open={confirmAssign}
          title={<FormattedMessage id="assign-agent" defaultMessage="Assign Agent" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-assign-this-agent" defaultMessage="Are you sure you want to assign this agent?" />}
          onClose={(ok) => ok ? handleAction('assign') : setConfirmAssign(false)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {confirmPickup && (
        <ConfirmationC
          open={confirmPickup}
          title={<FormattedMessage id="pickup" defaultMessage="Pickup" />}
          content={<FormattedMessage id="are-you-sure-agent-has-picked-up-the-goods" defaultMessage="Are you sure the agent has picked up the goods?" />}
          onClose={(ok) => ok ? handleAction('pickup') : setConfirmPickup(false)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {confirmStart && (
        <ConfirmationC
          open={confirmStart}
          title={<FormattedMessage id="start-delivery" defaultMessage="Start Delivery" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-start-delivery" defaultMessage="Are you sure you want to start this delivery?" />}
          onClose={(ok) => ok ? handleAction('start') : setConfirmStart(false)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {confirmComplete && (
        <ConfirmationC
          open={confirmComplete}
          title={<FormattedMessage id="complete-delivery" defaultMessage="Complete Delivery" />}
          content={<FormattedMessage id="are-you-sure-delivery-has-been-completed" defaultMessage="Are you sure this delivery has been completed?" />}
          onClose={(ok) => ok ? handleAction('complete') : setConfirmComplete(false)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {confirmFail && (
        <ModalC
          open={confirmFail}
          title={<FormattedMessage id="mark-as-failed" defaultMessage="Mark as Failed" />}
          onOk={() => handleAction('fail')}
          onCancel={() => setConfirmFail(false)}
          disabledOk={!failedReason.trim()}
          maxWidth="xs"
          fullWidth
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            label={<FormattedMessage id="failed-reason" defaultMessage="Failed Reason" />}
            value={failedReason}
            onChange={(e) => setFailedReason(e.target.value)}
            sx={{ mt: 1 }}
            required
          />
        </ModalC>
      )}

      {confirmCancel && (
        <ModalC
          open={confirmCancel}
          title={<FormattedMessage id="cancel-delivery-order" defaultMessage="Cancel Delivery Order" />}
          onOk={() => handleAction('cancel')}
          onCancel={() => setConfirmCancel(false)}
          maxWidth="xs"
          fullWidth
        >
          <TextField
            fullWidth
            multiline
            rows={3}
            label={<FormattedMessage id="cancel-reason" defaultMessage="Cancel Reason (Optional)" />}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </ModalC>
      )}
    </>
  );
};

OrderDetail.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default OrderDetail;
