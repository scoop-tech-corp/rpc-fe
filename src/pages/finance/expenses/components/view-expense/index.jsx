import { FormattedMessage } from 'react-intl';
import { Grid, InputLabel, Stack, Typography } from '@mui/material';
import ModalC from 'components/ModalC';
import configGlobal from '../../../../../config';
import { formatThousandSeparator } from 'utils/func';
import PropTypes from 'prop-types';

const formatAmount = (value) => {
  if (!value && value !== 0) return '-';
  return 'Rp ' + formatThousandSeparator(value);
};

const ViewExpense = (props) => {
  const { open, data, onClose } = props;

  return (
    <ModalC title="Detail Expense" open={open} onCancel={onClose} maxWidth="lg" fullWidth>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="transaction-date" />
            </InputLabel>
            <Typography variant="body1">{data?.transactionDate || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="reference-no" />
            </InputLabel>
            <Typography variant="body1">{data?.referenceNo || '-'}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="supplier2" />
            </InputLabel>
            <Typography variant="body1">{data?.vendorName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="location" />
            </InputLabel>
            <Typography variant="body1">{data?.branchName || '-'}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="category" />
            </InputLabel>
            <Typography variant="body1">{data?.categoryName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>Sub Total</InputLabel>
            <Typography variant="body1">{formatAmount(data?.subTotal)}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="department" />
            </InputLabel>
            <Typography variant="body1">{data?.departmentName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>PPH</InputLabel>
            <Typography variant="body1">{formatAmount(data?.pph)}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="expense-type" />
            </InputLabel>
            <Typography variant="body1">{data?.expenseTypeName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>Tax (PPN)</InputLabel>
            <Typography variant="body1">{formatAmount(data?.tax)}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="payment-status" />
            </InputLabel>
            <Typography variant="body1">{data?.paymentStatusName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="grand-total" />
            </InputLabel>
            <Typography variant="body1">{formatAmount(data?.grandTotal)}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="payment-method" />
            </InputLabel>
            <Typography variant="body1">{data?.paymentMethodName || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="due-date" />
            </InputLabel>
            <Typography variant="body1">{data?.dueDate || '-'}</Typography>
          </Stack>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="description" />
            </InputLabel>
            <Typography variant="body1">{data?.description || '-'}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="attachment" />
            </InputLabel>
            {data?.imagePath ? (
              <img
                src={`${configGlobal.apiUrl}${data.imagePath}`}
                alt="expense-attachment"
                style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
              />
            ) : (
              <Typography variant="body1">-</Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

ViewExpense.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default ViewExpense;
