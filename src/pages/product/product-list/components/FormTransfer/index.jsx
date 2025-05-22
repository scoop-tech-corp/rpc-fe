import { FormattedMessage } from 'react-intl';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  createProductTransfer,
  getLocationProductTransferDropdown,
  getProductTransferNumber,
  getStaffProductTransferDropdown
} from '../../service';
import { useDispatch } from 'react-redux';
import { formateDateDDMMYYY } from 'utils/func';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormTransfer = (props) => {
  const [transferNo, setTransferNo] = useState('');
  const [transferDate] = useState(formateDateDDMMYYY(new Date(), { isWithTime: { show: true, withSecond: false }, separator: '-' }));
  const [transferName, setTransferName] = useState('');
  const [branchOrigin] = useState(props.data.inventory.locationName);
  const [branchDestination, setBranchDestination] = useState(null);
  const [branchDestinationList, setBranchDestinationList] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [receiverList, setReceiverList] = useState([]);
  const [currentStock] = useState(props.data.inventory.stock);

  const [productName] = useState(props.data.fullName);
  const [additionalCost, setAdditionalCost] = useState('');
  const [remark, setRemark] = useState('');
  const [totalItem, setTotalItem] = useState('');
  const [isDisabledTransfer, setIsDisabledTransfer] = useState(true);

  const dispatch = useDispatch();

  const onSubmit = async () => {
    const param = {
      transferNumber: transferNo,
      transferName: transferName,
      locationId: branchDestination ? branchDestination.value : '',
      totalItem: totalItem,
      userIdReceiver: receiver ? receiver.value : '',
      productId: props.data.id,
      productType: props.data.productType, //productSell or productClinic
      additionalCost: additionalCost,
      remark: remark
    };
    await createProductTransfer(param)
      .then((resp) => {
        if (resp && resp.status === 200) {
          dispatch(snackbarSuccess(`transfer product successfully`));
          props.onClose(true);
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const onCancel = () => {
    props.onClose(false);
  };

  const onValidation = (e) => {
    const getTransferName = e.target.value || transferName;
    const getTotalItem = !isNaN(e.target.value) ? +e.target.value : totalItem;
    let isError = false;

    if (!getTransferName) {
      isError = true;
    } else if (!getTotalItem || +props.data.inventory.stock - getTotalItem < +props.data.inventory.lowStock) {
      isError = true;
    }

    setIsDisabledTransfer(isError);
  };

  const onTransferName = (e) => {
    setTransferName(e.target.value);
    setIsDisabledTransfer(Boolean(!+e.target.value));
    onValidation(e);
  };

  const onChangeTotalItem = (e) => {
    setTotalItem(e.target.value);
    onValidation(e);
  };

  const onChangeBranchDestination = (_, selected) => {
    setBranchDestination(selected);

    setReceiver(null);
    setReceiverList([]);
    if (selected) {
      getStaffProductTransfer(selected.value);
    }
  };

  const getProductTransferNo = async () => {
    const resp = await getProductTransferNumber();
    setTransferNo(resp.data);
  };

  const getLocationProductTransfer = async () => {
    const resp = await getLocationProductTransferDropdown({
      locationId: props.data.location.id,
      productName: props.data.fullName,
      productType: props.data.productType
    });
    setBranchDestinationList(resp);
  };

  const getStaffProductTransfer = async (locationId) => {
    const resp = await getStaffProductTransferDropdown(locationId);
    setReceiverList(resp);
  };

  useEffect(() => {
    getProductTransferNo();
    getLocationProductTransfer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log('transferDate ADI', transferDate);
  return (
    <ModalC
      title={<FormattedMessage id="transfer-product" />}
      okText={<FormattedMessage id="transfer" />}
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      disabledOk={isDisabledTransfer}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 700 } }}
      maxWidth="sm"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="no-transfer">{<FormattedMessage id="no-transfer" />}</InputLabel>
            <TextField fullWidth id="transferNo" name="transferNo" value={transferNo} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="transfer-date">{<FormattedMessage id="transfer-date" />}</InputLabel>
            <TextField fullWidth id="transferDate" name="transferDate" value={transferDate} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="transfer-name">{<FormattedMessage id="transfer-name" />}</InputLabel>
            <TextField fullWidth id="transferName" name="transferName" value={transferName} onChange={onTransferName} />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="product-name">{<FormattedMessage id="product-name" />}</InputLabel>
            <TextField fullWidth id="productName" name="productName" value={productName} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="branch-origin">{<FormattedMessage id="branch-origin" />}</InputLabel>
            <TextField fullWidth id="branchOrigin" name="branchOrigin" value={branchOrigin} inputProps={{ readOnly: true }} />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="current-stock">{<FormattedMessage id="current-stock" />}</InputLabel>
            <Stack spacing={1} flexDirection="row" alignItems={'center'}>
              <TextField
                fullWidth
                type="number"
                id="currentStock"
                name="currentStock"
                value={currentStock}
                inputProps={{ readOnly: true }}
                style={{ flexBasis: '40%' }}
              />
              <span style={{ flexBasis: '60%', marginLeft: '10px', marginTop: 'unset' }}>
                <b>{props.data.inventory.lowStock}</b> <FormattedMessage id="limit-stock-in-this-location" />
              </span>
            </Stack>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="branch-destination">{<FormattedMessage id="branch-destination" />}</InputLabel>
            <Autocomplete
              id="branch-destination"
              options={branchDestinationList}
              value={branchDestination}
              isOptionEqualToValue={(option, val) => val === '' || +option.value === +val.value}
              onChange={onChangeBranchDestination}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="total-item">{<FormattedMessage id="total-item" />}</InputLabel>
            <Stack spacing={1}>
              <TextField
                fullWidth
                type="number"
                id="totalItem"
                name="totalItem"
                value={totalItem}
                onChange={onChangeTotalItem}
                style={{ flexBasis: '60%' }}
              />
            </Stack>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="receiver">{<FormattedMessage id="receiver" />}</InputLabel>
            <Autocomplete
              id="receiver"
              options={receiverList}
              value={receiver}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, selected) => setReceiver(selected)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="additional-cost">{<FormattedMessage id="additional-cost" />}</InputLabel>
            <TextField
              fullWidth
              type="number"
              id="additionalCost"
              name="additionalCost"
              value={additionalCost}
              onChange={(e) => setAdditionalCost(e.target.value)}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel htmlFor="remark">{<FormattedMessage id="remark" />}</InputLabel>
            <TextField fullWidth id="remark" name="remark" value={remark} onChange={(e) => setRemark(e.target.value)} />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormTransfer.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default FormTransfer;
