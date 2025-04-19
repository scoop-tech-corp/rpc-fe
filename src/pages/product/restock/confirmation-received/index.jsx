import { Button, Stack, TextField, useMediaQuery } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductRestockDetail, productRestockApproval } from '../service';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import ConfirmationC from 'components/ConfirmationC';
import FormReject from 'components/FormReject';

const ProductRestockConfirmationReceived = (props) => {
  const [productRestockConfirmationReceivedData, setProductRestockApprovalData] = useState([]);
  const [isDisabledSubmit, setIsDisabledSubmit] = useState(true);
  const [isDialogApprovalAll, setIsDialogApprovalAll] = useState(false);
  const [isDialogRejectAll, setIsDialogRejectAll] = useState(false);
  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const getDetail = async () => {
    await getProductRestockDetail(props.id).then((resp) => {
      const getData =
        resp && Array.isArray(resp.data)
          ? resp.data.map((dt) => {
              return {
                ...dt,
                productRestockDetailId: dt.id,
                reStockQuantity: dt.orderQuantity,
                rejected: 0,
                errRejected: '',
                accepted: 0,
                errAccepted: '',
                reasonReject: '',
                errReasonRejected: ''
              };
            })
          : [];
      setProductRestockApprovalData(getData);
    });
  };

  const onActionRestock = async (isAcceptedAll = 0, isRejectedAll = 0, reasonRejectAll = '') => {
    await productRestockApproval({
      id: props.id,
      productRestocks: isAcceptedAll || isRejectedAll ? [] : productRestockConfirmationReceivedData,
      isAcceptedAll,
      isRejectedAll,
      reasonRejectAll
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          let msg = '';
          if (isRejectedAll) {
            msg = 'Reject all restock has been successfully';
          } else if (isAcceptedAll) {
            msg = 'Accepted all restock has been successfully';
          } else {
            msg = 'Submit product restock approval has been successfully';
          }

          dispatch(snackbarSuccess(msg));
          setIsDialogApprovalAll(false);
          setIsDialogRejectAll(false);
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onApprovalAll = async (respConfirm) => {
    if (respConfirm) {
      onActionRestock(1);
    } else {
      setIsDialogApprovalAll(false);
    }
  };
  const onRejectAll = (value) => onActionRestock(0, 1, value);
  const onSubmit = () => onActionRestock();

  const onFieldTableHandler = (idxRow, key, e) => {
    setProductRestockApprovalData((prevState) => {
      const newData = [...prevState];
      newData[idxRow][key] = key == 'reasonReject' ? e.target.value : +e.target.value;

      let isErrTable = false;

      newData.forEach((dt) => {
        dt.errReasonRejected = '';
        dt.errRejected = '';
        dt.errAccepted = '';

        if (dt.rejected && !dt.reasonReject) {
          dt.errReasonRejected = 'harus di isi';
          isErrTable = true;
        }

        if (dt.rejected) {
          const diff = dt.reStockQuantity - dt.rejected;
          if (dt.accepted != diff) {
            dt.errAccepted = `harus di isi ${diff}`;
            isErrTable = true;
          }
        }

        if (dt.accepted) {
          const diff = dt.reStockQuantity - dt.accepted;
          if (dt.rejected != diff) {
            dt.errRejected = `harus di isi ${diff}`;
            isErrTable = true;
          }
        }
      });

      setIsDisabledSubmit(isErrTable);

      return newData;
    });
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="pr-number" />,
        accessor: 'purchaseRequestNumber',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'fullName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-cost" />,
        accessor: 'unitCost',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="order-quantity" />,
        accessor: 'reStockQuantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="rejected" />,
        accessor: 'rejected',
        isNotSorting: true,
        Cell: (data) => {
          const reject = +data.row.original.rejected;
          const errReject = data.row.original.errRejected;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              type="number"
              id="rejected"
              name="rejected"
              value={reject}
              onChange={(e) => onFieldTableHandler(idx, 'rejected', e)}
              inputProps={{ min: 0 }}
              error={Boolean(errReject && errReject.length > 0)}
              helperText={errReject}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="accepted" />,
        accessor: 'accepted',
        isNotSorting: true,
        Cell: (data) => {
          const accepted = +data.row.original.accepted;
          const errAccepted = data.row.original.errAccepted;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              type="number"
              id="accepted"
              name="accepted"
              value={accepted}
              onChange={(e) => onFieldTableHandler(idx, 'accepted', e)}
              inputProps={{ min: 0 }}
              error={Boolean(errAccepted && errAccepted.length > 0)}
              helperText={errAccepted}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="rejected-reason" />,
        accessor: 'reasonReject',
        isNotSorting: true,
        Cell: (data) => {
          const reasonReject = data.row.original.reasonReject;
          const errReasonRejected = data.row.original.errReasonRejected;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              id="reasonReject"
              name="reasonReject"
              value={reasonReject}
              onChange={(e) => onFieldTableHandler(idx, 'reasonReject', e)}
              error={Boolean(errReasonRejected && errReasonRejected.length > 0)}
              helperText={errReasonRejected}
            />
          );
        }
      }
    ],
    []
  );

  useEffect(() => {
    getDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ModalC
        title={<FormattedMessage id="product-restock-approval" />}
        open={props.open}
        onOk={onSubmit}
        onCancel={() => props.onClose(false)}
        disabledOk={isDisabledSubmit}
        fullWidth
        maxWidth="xl"
      >
        <Stack spacing={3}>
          <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
            <Button variant="contained" onClick={() => setIsDialogApprovalAll(true)} color="success">
              <FormattedMessage id="approve-all" />
            </Button>
            <Button variant="contained" onClick={() => setIsDialogRejectAll(true)} color="error">
              <FormattedMessage id="reject-all" />
            </Button>
          </Stack>
          <ReactTable columns={columns} data={productRestockConfirmationReceivedData} />
        </Stack>
      </ModalC>
      <ConfirmationC
        open={isDialogApprovalAll}
        title={<FormattedMessage id="approve-all" />}
        content={<FormattedMessage id="are-you-sure-want-to-accept-all-product?" />}
        onClose={(response) => onApprovalAll(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      <FormReject
        open={isDialogRejectAll}
        title={<FormattedMessage id="confirmation-and-please-fill-in-the-reason-for-product-rejection" />}
        onSubmit={(value) => onRejectAll(value)}
        onClose={() => setIsDialogRejectAll(false)}
      />
    </>
  );
};

ProductRestockConfirmationReceived.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductRestockConfirmationReceived;
