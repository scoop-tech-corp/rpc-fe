import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import { getStockOpnameDetail, startStockOpname, approvalCheckerStockOpname, approvalDirectorStockOpname } from '../service';
import { ReactTable } from 'components/third-party/ReactTable';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { useNavigate } from 'react-router';
import { EditOutlined } from '@ant-design/icons';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';

import ModalC from 'components/ModalC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';
import PropTypes from 'prop-types';

const STATUS_MAP = {
  1: { label: 'Draft', color: 'warning' },
  2: { label: 'On Progress', color: 'info' },
  3: { label: 'Pending Approval Checker', color: 'secondary' },
  4: { label: 'Pending Approval Director', color: 'secondary' },
  5: { label: 'Done', color: 'success' },
  6: { label: 'Rejected', color: 'error' }
};

const DetailItem = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Typography variant="h6" fontWeight="bold">
      {label}
    </Typography>
    <Typography variant="body1">{value ?? '-'}</Typography>
  </Grid>
);

const StockOpnameDetail = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [confirmStart, setConfirmStart] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [openReject, setOpenReject] = useState(false);
  const [confirmApproveDirector, setConfirmApproveDirector] = useState(false);
  const [openRejectDirector, setOpenRejectDirector] = useState(false);

  const columnUsers = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: <FormattedMessage id="name" />, accessor: 'name', isNotSorting: true }
    ],
    []
  );

  const columnLogs = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: <FormattedMessage id="event" />, accessor: 'event', isNotSorting: true },
      { Header: <FormattedMessage id="details" />, accessor: 'details', isNotSorting: true },
      { Header: <FormattedMessage id="performed-by" />, accessor: 'performedBy', isNotSorting: true },
      { Header: <FormattedMessage id="created-at" />, accessor: 'createdAt', isNotSorting: true }
    ],
    []
  );

  const columnProducts = useMemo(
    () => [
      { Header: 'No', accessor: (_row, i) => i + 1, id: 'no', isNotSorting: true },
      { Header: 'SKU', accessor: 'sku', isNotSorting: true },
      { Header: <FormattedMessage id="product" />, accessor: 'fullName', isNotSorting: true },
      { Header: <FormattedMessage id="system-quantity" />, accessor: 'stockSystem', isNotSorting: true },
      { Header: <FormattedMessage id="actual-quantity" />, accessor: 'stockPhysical', isNotSorting: true },
      { Header: <FormattedMessage id="difference" />, accessor: 'difference', isNotSorting: true }
    ],
    []
  );

  const getDetail = async () => {
    await getStockOpnameDetail(props.id)
      .then((resp) => setData(resp.data))
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onConfirmApprove = async (value) => {
    if (value) {
      await approvalCheckerStockOpname({ id: props.id, isApproved: 1, reason: '' })
        .then((resp) => {
          if (resp.status === 200) {
            setConfirmApprove(false);
            dispatch(snackbarSuccess('Stock opname approved'));
            props.onSuccess();
          }
        })
        .catch((err) => {
          if (err) {
            setConfirmApprove(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setConfirmApprove(false);
    }
  };

  const onReject = async (reason) => {
    await approvalCheckerStockOpname({ id: props.id, isApproved: 0, reason })
      .then((resp) => {
        if (resp.status === 200) {
          setOpenReject(false);
          dispatch(snackbarSuccess('Stock opname rejected'));
          props.onSuccess();
        }
      })
      .catch((err) => {
        if (err) {
          setOpenReject(false);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const onConfirmApproveDirector = async (value) => {
    if (value) {
      await approvalDirectorStockOpname({ id: props.id, isApproved: 1, reason: '' })
        .then((resp) => {
          if (resp.status === 200) {
            setConfirmApproveDirector(false);
            dispatch(snackbarSuccess('Stock opname approved'));
            props.onSuccess();
          }
        })
        .catch((err) => {
          if (err) {
            setConfirmApproveDirector(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setConfirmApproveDirector(false);
    }
  };

  const onRejectDirector = async (reason) => {
    await approvalDirectorStockOpname({ id: props.id, isApproved: 0, reason })
      .then((resp) => {
        if (resp.status === 200) {
          setOpenRejectDirector(false);
          dispatch(snackbarSuccess('Stock opname rejected'));
          props.onSuccess();
        }
      })
      .catch((err) => {
        if (err) {
          setOpenRejectDirector(false);
          dispatch(snackbarError(createMessageBackend(err, true, true)));
        }
      });
  };

  const onConfirmStart = async (value) => {
    if (value) {
      await startStockOpname(props.id)
        .then((resp) => {
          if (resp.status === 200) {
            setConfirmStart(false);
            dispatch(snackbarSuccess('Stock opname started'));
            props.onSuccess();
          }
        })
        .catch((err) => {
          if (err) {
            setConfirmStart(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setConfirmStart(false);
    }
  };

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = STATUS_MAP[+data?.statusId] ?? { label: '-', color: 'default' };
  const isDraft = +data?.statusId === 1;
  const isOnProgress = +data?.statusId === 2;
  const isPendingApprovalChecker = +data?.statusId === 3;
  const isPendingApprovalDirector = +data?.statusId === 4;

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-stock-opname" />}
        open={props.open}
        onCancel={props.onClose}
        isModalAction={false}
        fullWidth
        maxWidth="md"
        action={{
          element: (
            <Stack direction="row" spacing={1}>
              {isDraft && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<EditOutlined />}
                    onClick={() => navigate(`/product/stockopname/form/${props.id}`, { replace: true })}
                  >
                    <FormattedMessage id="edit" />
                  </Button>
                  <Button variant="contained" startIcon={<PlayArrowOutlinedIcon />} onClick={() => setConfirmStart(true)} color="success">
                    <FormattedMessage id="start-stock-opname" />
                  </Button>
                </>
              )}
              {isOnProgress && (
                <Button variant="contained" onClick={() => navigate(`/product/stockopname/input-product/${props.id}`)} color="primary">
                  <FormattedMessage id="input-product" />
                </Button>
              )}
              {isPendingApprovalChecker && (
                <>
                  <Button variant="contained" color="success" onClick={() => setConfirmApprove(true)}>
                    <FormattedMessage id="approve" />
                  </Button>
                  <Button variant="contained" color="error" onClick={() => setOpenReject(true)}>
                    <FormattedMessage id="reject" />
                  </Button>
                </>
              )}
              {isPendingApprovalDirector && (
                <>
                  <Button variant="contained" color="success" onClick={() => setConfirmApproveDirector(true)}>
                    <FormattedMessage id="approve" />
                  </Button>
                  <Button variant="contained" color="error" onClick={() => setOpenRejectDirector(true)}>
                    <FormattedMessage id="reject" />
                  </Button>
                </>
              )}
            </Stack>
          ),
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="information" />}>
              <Grid container spacing={2}>
                <DetailItem label={<FormattedMessage id="id-number" />} value={data?.stockOpnameNumber} />
                <DetailItem label={<FormattedMessage id="title" />} value={data?.title} />
                <DetailItem label={<FormattedMessage id="start-time" />} value={data?.startTime} />
                <DetailItem label={<FormattedMessage id="location" />} value={data?.locationName} />
                <DetailItem label={<FormattedMessage id="created-by" />} value={data?.createdBy} />
                <DetailItem label={<FormattedMessage id="created-at" />} value={data?.createdAt} />
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="h6" fontWeight="bold">
                    Status
                  </Typography>
                  <Chip color={status.color} label={status.label} size="small" variant="light" />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="users" />}>
              <ScrollX>
                <ReactTable columns={columnUsers} data={data?.users ?? []} />
              </ScrollX>
            </MainCard>
          </Grid>

          <Grid item xs={12}>
            <MainCard title={<FormattedMessage id="product" />}>
              <ScrollX>
                <ReactTable columns={columnProducts} data={data?.products ?? []} />
              </ScrollX>
            </MainCard>
          </Grid>

          {data?.logs?.length > 0 && (
            <Grid item xs={12}>
              <MainCard title={<FormattedMessage id="log" />}>
                <ScrollX>
                  <ReactTable columns={columnLogs} data={data.logs} />
                </ScrollX>
              </MainCard>
            </Grid>
          )}
        </Grid>
      </ModalC>

      {confirmStart && (
        <ConfirmationC
          open={confirmStart}
          title={<FormattedMessage id="start-stock-opname" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-start-stock-opname" />}
          onClose={(response) => onConfirmStart(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
      {confirmApprove && (
        <ConfirmationC
          open={confirmApprove}
          title={<FormattedMessage id="approve" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-approve-this-stock-opname" />}
          onClose={(response) => onConfirmApprove(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
      {openReject && (
        <FormReject
          open={openReject}
          title={<FormattedMessage id="reject" />}
          onSubmit={(reason) => onReject(reason)}
          onClose={() => setOpenReject(false)}
        />
      )}
      {confirmApproveDirector && (
        <ConfirmationC
          open={confirmApproveDirector}
          title={<FormattedMessage id="approve" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-approve-this-stock-opname" />}
          onClose={(response) => onConfirmApproveDirector(response)}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
      {openRejectDirector && (
        <FormReject
          open={openRejectDirector}
          title={<FormattedMessage id="reject" />}
          onSubmit={(reason) => onRejectDirector(reason)}
          onClose={() => setOpenRejectDirector(false)}
        />
      )}
    </>
  );
};

StockOpnameDetail.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export default StockOpnameDetail;
