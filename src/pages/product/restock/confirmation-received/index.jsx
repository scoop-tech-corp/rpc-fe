import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getProductRestockDetail, productRestockConfirmReceive } from '../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { formatThousandSeparator } from 'utils/func';

const ProductRestockConfirmationReceived = (props) => {
  const [productRestockConfirmationReceivedData, setProductRestockConfirmationReceivedData] = useState([]);
  const [restockFinished, setRestockFinished] = useState('yes');

  const [isDisabledSubmit, setIsDisabledSubmit] = useState(true);
  const dispatch = useDispatch();

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const handleChangeRestockFinished = (event) => {
    setRestockFinished(event.target.value);
  };
  const getDetail = async () => {
    await getProductRestockDetail(props.id, 'receive').then((resp) => {
      const getData =
        resp && Array.isArray(resp.data)
          ? resp.data.map((dt) => {
              return {
                ...dt,
                productRestockDetailId: dt.id,
                reStockQuantity: dt.orderQuantity,
                rejected: +dt.rejected,
                accepted: +dt.accepted,
                received: 0,
                errReceived: '',
                cancelled: 0,
                errCancelled: '',
                reasonCancelled: '',
                errReasonCancelled: '',
                expiredDate: '',
                errExpiredDate: '',
                sku: '',
                errSku: '',
                image: '',
                errImage: '',
                imageOriginalName: ''
              };
            })
          : [];

      setProductRestockConfirmationReceivedData(getData);
    });
  };

  const onActionRestock = async () => {
    await productRestockConfirmReceive({
      id: props.id,
      productRestocks: productRestockConfirmationReceivedData.map((dt) => ({
        productRestockDetailId: dt.productRestockDetailId,
        accepted: dt.accepted,
        received: dt.received,
        canceled: dt.cancelled,
        expiredDate: dt.expiredDate,
        sku: dt.sku,
        reasonCancel: dt.reasonCancelled,
        imagePath: dt.image,
        originalName: dt.imageOriginalName
      })),
      isFinished: restockFinished === 'yes' ? 1 : 0
    })
      .then((resp) => {
        if (resp && resp.status === 200) {
          let msg = 'Submit product restock confirmation received has been successfully';

          dispatch(snackbarSuccess(msg));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const onSubmit = () => onActionRestock();

  const onFieldTableHandler = (idxRow, key, e) => {
    setProductRestockConfirmationReceivedData((prevState) => {
      const newData = [...prevState];

      if (['reasonCancelled', 'expiredDate', 'sku'].includes(key)) {
        newData[idxRow][key] = e.target.value;
      } else if (key == 'image') {
        const file = e.target.files?.[0];
        newData[idxRow]['imageOriginalName'] = file.name;
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          newData[idxRow][key] = base64String;
        };
        reader.readAsDataURL(file);
      } else {
        newData[idxRow][key] = +e.target.value;
      }

      let isErrTable = false;

      newData.forEach((dt) => {
        dt.errReasonCancelled = '';
        dt.errCancelled = '';
        dt.errReceived = '';
        dt.errExpiredDate = '';
        dt.errSku = '';
        dt.errImage = '';

        if (dt.cancelled && !dt.reasonCancelled) {
          dt.errReasonCancelled = 'harus di isi';
          isErrTable = true;
        }

        if (dt.cancelled) {
          const diff = dt.accepted - dt.cancelled;
          if (dt.received != diff) {
            dt.errReceived = `harus di isi ${diff}`;
            isErrTable = true;
          }
        }

        if (dt.received) {
          const diff = dt.accepted - dt.received;
          if (dt.cancelled != diff) {
            dt.errCancelled = `harus di isi ${diff}`;
            isErrTable = true;
          }
        }

        if (!dt.expiredDate) {
          dt.errExpiredDate = 'harus di isi';
          isErrTable = true;
        }

        if (!dt.sku) {
          dt.errSku = 'harus di isi';
          isErrTable = true;
        }

        if (!dt.imageOriginalName) {
          dt.errImage = 'harus di isi';
          isErrTable = true;
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
        isNotSorting: true,
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="order-quantity" />,
        accessor: 'reStockQuantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="rejected" />,
        accessor: 'rejected',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="accepted" />,
        accessor: 'accepted',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="received" />,
        accessor: 'received',
        isNotSorting: true,
        Cell: (data) => {
          const receive = +data.row.original.received;
          const errReceive = data.row.original.errReceived;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              type="number"
              id="received"
              name="received"
              value={receive}
              onChange={(e) => onFieldTableHandler(idx, 'received', e)}
              inputProps={{ min: 0 }}
              error={Boolean(errReceive && errReceive.length > 0)}
              helperText={errReceive}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="cancelled" />,
        accessor: 'cancelled',
        isNotSorting: true,
        Cell: (data) => {
          const cancelled = +data.row.original.cancelled;
          const errCancelled = data.row.original.errCancelled;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              type="number"
              id="cancelled"
              name="cancelled"
              value={cancelled}
              onChange={(e) => onFieldTableHandler(idx, 'cancelled', e)}
              inputProps={{ min: 0 }}
              error={Boolean(errCancelled && errCancelled.length > 0)}
              helperText={errCancelled}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="cancelled-reason" />,
        accessor: 'reasonCancelled',
        isNotSorting: true,
        Cell: (data) => {
          const reasonCancelled = data.row.original.reasonCancelled;
          const errReasonCancelled = data.row.original.errReasonCancelled;
          const idx = data.row.index;
          return (
            <TextField
              fullWidth
              id="reasonCancelled"
              name="reasonCancelled"
              value={reasonCancelled}
              onChange={(e) => onFieldTableHandler(idx, 'reasonCancelled', e)}
              error={Boolean(errReasonCancelled && errReasonCancelled.length > 0)}
              helperText={errReasonCancelled}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="expired-date" />,
        accessor: 'expiredDate',
        isNotSorting: true,
        Cell: (data) => {
          const expiredDate = data.row.original.expiredDate;
          const errExpiredDate = data.row.original.errExpiredDate;
          const idx = data.row.index;

          return (
            <TextField
              fullWidth
              id="expiredDate"
              name="expiredDate"
              type="date"
              value={expiredDate}
              onChange={(e) => onFieldTableHandler(idx, 'expiredDate', e)}
              error={Boolean(errExpiredDate && errExpiredDate.length > 0)}
              helperText={errExpiredDate}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="sku" />,
        accessor: 'sku',
        isNotSorting: true,
        Cell: (data) => {
          const sku = data.row.original.sku;
          const errSku = data.row.original.errSku;
          const idx = data.row.index;

          return (
            <TextField
              fullWidth
              type="text"
              id="sku"
              name="sku"
              value={sku}
              onChange={(e) => onFieldTableHandler(idx, 'sku', e)}
              error={Boolean(errSku && errSku.length > 0)}
              helperText={errSku}
              sx={{
                minWidth: '150px'
              }}
            />
          );
        }
      },
      {
        Header: <FormattedMessage id="image" />,
        accessor: 'image',
        isNotSorting: true,
        Cell: (data) => {
          const errImage = data.row.original.errImage;
          const idx = data.row.index;

          return (
            <TextField
              fullWidth
              type="file"
              id="image"
              name="image"
              onChange={(e) => onFieldTableHandler(idx, 'image', e)}
              error={Boolean(errImage && errImage.length > 0)}
              helperText={errImage}
              sx={{
                minWidth: '150px'
              }}
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
        <Box display="flex" alignItems="center" gap={2}>
          <FormControl>
            <FormLabel
              sx={{
                fontSize: 14,
                whiteSpace: 'nowrap'
              }}
            >
              <FormattedMessage id="restock-finished" />
            </FormLabel>
          </FormControl>
          <RadioGroup row value={restockFinished} onChange={handleChangeRestockFinished}>
            <FormControlLabel value="yes" control={<Radio />} label={<FormattedMessage id="yes" />} />
            <FormControlLabel value="no" control={<Radio />} label={<FormattedMessage id="no" />} />
          </RadioGroup>
        </Box>
        <ReactTable columns={columns} data={productRestockConfirmationReceivedData} />
      </ModalC>
    </>
  );
};

ProductRestockConfirmationReceived.propTypes = {
  id: PropTypes.number,
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default ProductRestockConfirmationReceived;
