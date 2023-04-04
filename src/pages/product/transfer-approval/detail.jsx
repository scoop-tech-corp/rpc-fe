import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Stack } from '@mui/material';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import configGlobal from '../../../config';

const DetailTransferProduct = (props) => {
  const { data } = props;

  const onCancel = () => {
    props.onClose(true);
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transfer-product" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="no-transfer">{<FormattedMessage id="no-transfer" />}</InputLabel>
              {data.transferNumber}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="transfer-date">{<FormattedMessage id="transfer-date" />}</InputLabel>
              {data.transferDate}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="transfer-name">{<FormattedMessage id="transfer-name" />}</InputLabel>
              {data.transferName}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="total-item">{<FormattedMessage id="total-item" />}</InputLabel>
              {data.totalItem}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="origin">{<FormattedMessage id="origin" />}</InputLabel>
              {data.origin}
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="additional-cost">{<FormattedMessage id="additional-cost" />}</InputLabel>
              {data.additionalCost}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="destination">{<FormattedMessage id="destination" />}</InputLabel>
              {data.destination}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="remark">{<FormattedMessage id="remark" />}</InputLabel>
              {data.remark}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="product-name">{<FormattedMessage id="product-name" />}</InputLabel>
              {data.productName}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="admin-approval">{<FormattedMessage id="admin-approval" />}</InputLabel>
              {data.isAdminApproval}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="receiver">{<FormattedMessage id="receiver" />}</InputLabel>
              {data.receivedBy}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="admin-status">{<FormattedMessage id="admin-status" />}</InputLabel>
              {data.statusAdmin}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="received-at">{<FormattedMessage id="received-at" />}</InputLabel>
              {data.receivedAt}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="admin-approved-at">{<FormattedMessage id="admin-approved-at" />}</InputLabel>
              {data.adminApprovedAt || '-'}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="reference">{<FormattedMessage id="reference" />}</InputLabel>
              {data.reference || '-'}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="admin-approved-by">{<FormattedMessage id="admin-approved-by" />}</InputLabel>
              {data.adminApprovedBy || '-'}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="created-by">{<FormattedMessage id="created-by" />}</InputLabel>
              {data.createdBy}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="office-status">{<FormattedMessage id="office-status" />}</InputLabel>
              {data.statusOffice}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="created-at">{<FormattedMessage id="created-at" />}</InputLabel>
              {data.createdAt}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="office-approved-at">{<FormattedMessage id="office-approved-at" />}</InputLabel>
              {data.officeApprovedAt}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="image">{<FormattedMessage id="image" />}</InputLabel>
              {data.imagePath ? (
                <a href={`${configGlobal.apiUrl}${data.imagePath}`} target="blank">
                  <img alt="img-detail" src={`${configGlobal.apiUrl}${data.imagePath}`} width="70%" />
                </a>
              ) : (
                '-'
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel htmlFor="office-approved-by">{<FormattedMessage id="office-approved-by" />}</InputLabel>
              {data.officeApprovedBy}
            </Stack>
          </Grid>
        </Grid>
      </ModalC>
    </>
  );
};

DetailTransferProduct.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default DetailTransferProduct;
