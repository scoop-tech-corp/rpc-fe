import { Grid, IconButton, InputLabel, Link, Stack } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { printInvoicePetClinic, uploadProofOfPayment } from '../pages/pet-clinic/service';
import { createMessageBackend, processDownloadPDF } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { useDispatch } from 'react-redux';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import ScrollX from 'components/ScrollX';
import PropTypes from 'prop-types';
import PrintIcon from '@mui/icons-material/Print';
import ModalC from 'components/ModalC';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';

const LogPaymentDetailTransaction = (props) => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState([null, null]);
  const [proofPaymentDialog, setProofPaymentDialog] = useState({ open: false, id: null });
  const [file, setFile] = useState(null);

  const onFilterDateRange = (selectedDate) => {
    setSelectedDateRange(selectedDate);
    setFilter((filterPrev) => ({ ...filterPrev, dateRange: selectedDate }));
  };

  useEffect(() => {
    props.onFetchData(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const onUploadProofPayment = async () => {
    try {
      await uploadProofOfPayment({ paymentId: proofPaymentDialog.id, file: file[0] });
      dispatch(snackbarSuccess('Success upload payment pet clinic transaction'));
      setProofPaymentDialog({ open: false, id: null });
      props.onFetchData({ dateRange: null });
    } catch (err) {
      if (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    }
  };

  const columns = useMemo(
    () => [
      { Header: <FormattedMessage id="date" />, accessor: 'date', isNotSorting: true },
      {
        Header: 'Nota Number',
        accessor: 'notaNumber',
        isNotSorting: true,
        Cell: (data) => {
          const getId = +data.row.original.id;
          return <Link onClick={() => setProofPaymentDialog({ open: true, id: getId })}>{data.value}</Link>;
        }
      },
      { Header: <FormattedMessage id="amount" />, accessor: 'amount', isNotSorting: true },
      { Header: <FormattedMessage id="payment-method" />, accessor: 'paymentMethod', isNotSorting: true },
      { Header: <FormattedMessage id="created-by" />, accessor: 'createdBy', isNotSorting: true },
      {
        Header: <FormattedMessage id="print-invoice" />,
        accessor: 'action',
        style: { textAlign: 'center' },
        isNotSorting: true,
        Cell: (data) => {
          const getId = +data.row.original.id;

          const doPrint = async () => {
            try {
              const resp = await printInvoicePetClinic(getId);
              if (resp && resp.status === 200) {
                processDownloadPDF(resp);
              }
            } catch (error) {
              dispatch(snackbarError(createMessageBackend(error)));
            }
          };

          return (
            <Stack spacing={0.1} direction={'row'} justifyContent="center">
              <IconButton size="large" color="success" onClick={doPrint}>
                <PrintIcon />
              </IconButton>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DateRangePicker onChange={(value) => onFilterDateRange(value)} value={selectedDateRange} format="dd/MM/yyy" />
        </Grid>
        <Grid item xs={12}>
          <ScrollX>
            <ReactTable columns={columns} data={props.data || []} />
          </ScrollX>
        </Grid>
      </Grid>

      <ModalC
        title={<FormattedMessage id="upload-proof-of-payment" />}
        open={proofPaymentDialog.open}
        onOk={onUploadProofPayment}
        onCancel={() => setProofPaymentDialog({ open: false, id: null })}
        fullWidth
        maxWidth="sm"
      >
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="upload-image" />
          </InputLabel>
          <SingleFileUpload file={file} setFieldValue={(_, value) => setFile(value)} />
        </Stack>
      </ModalC>
    </>
  );
};

LogPaymentDetailTransaction.propTypes = {
  data: PropTypes.array,
  onFetchData: PropTypes.func
};

export default LogPaymentDetailTransaction;
