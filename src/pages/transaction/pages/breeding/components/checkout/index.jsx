import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createPaymentBreedingOutpatient, getBreedingCheckoutSummary } from '../../service';

const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

const CheckoutBreeding = ({ open, data, onClose }) => {
  const { transactionId } = data;
  const dispatch = useDispatch();

  const [summary, setSummary] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingPay, setLoadingPay] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoadingSummary(true);
      try {
        const resp = await getBreedingCheckoutSummary(transactionId);
        setSummary(resp.data);
        setPaymentMethods(resp.data.payment_methods ?? []);
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      } finally {
        setLoadingSummary(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePay = async () => {
    if (!paymentMethodId) {
      dispatch(snackbarError('Pilih metode pembayaran terlebih dahulu.'));
      return;
    }
    setLoadingPay(true);
    try {
      // Bangun payload payment menggunakan format payment() yang sudah ada
      const formValue = {
        summaryList: [
          ...(summary.services ?? []).map((s) => ({
            serviceId: s.serviceId,
            item_name: s.itemName,
            category: 'layanan',
            quantity: s.quantity,
            bonus: 0,
            discount: 0,
            unit_price: s.price,
            total: s.quantity * s.price,
            promoId: null,
            promoCategory: null
          })),
          ...(summary.products ?? []).map((p) => ({
            productId: p.productId,
            item_name: p.itemName,
            category: 'produk',
            quantity: p.quantity,
            bonus: 0,
            discount: 0,
            unit_price: p.price,
            total: p.quantity * p.price,
            promoId: null,
            promoCategory: null
          })),
          ...(summary.additionals ?? []).map((a) => ({
            item_name: a.itemName,
            category: a.type,
            quantity: a.quantity,
            bonus: 0,
            discount: 0,
            unit_price: a.price,
            total: a.total,
            promoId: null,
            promoCategory: null
          }))
        ],
        summarySubtotal: summary.subtotal_bruto,
        summaryTotalDiscount: 0,
        discountBasedSale: 0,
        summaryTotalPayment: summary.grand_total,
        promoBasedSaleId: null,
        paymentMethod: 'full',
        paymentMethodId
      };

      await createPaymentBreedingOutpatient(transactionId, formValue);
      dispatch(snackbarSuccess('Pembayaran berhasil! Transaksi selesai.'));
      onClose(true);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setLoadingPay(false);
    }
  };

  return (
    <ModalC
      title="Checkout Breeding — Pembayaran Akhir"
      open={open}
      onCancel={() => onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="sm"
    >
      {loadingSummary ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
          <Alert severity="info">Ringkasan tagihan akhir breeding.</Alert>

          {/* Layanan Treatment Awal */}
          {(summary?.services?.length > 0 || summary?.products?.length > 0) && (
            <>
              <Typography variant="subtitle2">Treatment Awal</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(summary?.services ?? []).map((s, i) => (
                    <TableRow key={`s-${i}`}>
                      <TableCell>{s.itemName}</TableCell>
                      <TableCell align="right">{s.quantity}</TableCell>
                      <TableCell align="right">Rp {fmt(s.price)}</TableCell>
                      <TableCell align="right">Rp {fmt(s.quantity * s.price)}</TableCell>
                    </TableRow>
                  ))}
                  {(summary?.products ?? []).map((p, i) => (
                    <TableRow key={`p-${i}`}>
                      <TableCell>{p.itemName}</TableCell>
                      <TableCell align="right">{p.quantity}</TableCell>
                      <TableCell align="right">Rp {fmt(p.price)}</TableCell>
                      <TableCell align="right">Rp {fmt(p.quantity * p.price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          {/* Tindakan Tambahan */}
          {(summary?.additionals?.length ?? 0) > 0 && (
            <>
              <Typography variant="subtitle2">Tindakan Tambahan</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {summary.additionals.map((a, i) => (
                    <TableRow key={`a-${i}`}>
                      <TableCell>{a.itemName}</TableCell>
                      <TableCell align="right">{a.quantity}</TableCell>
                      <TableCell align="right">Rp {fmt(a.price)}</TableCell>
                      <TableCell align="right">Rp {fmt(a.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}

          <Divider />

          {/* Summary Totals */}
          <Stack spacing={0.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Subtotal</Typography>
              <Typography variant="body2">Rp {fmt(summary?.subtotal_bruto)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="warning.main">
                Total DP dibayar
              </Typography>
              <Typography variant="body2" color="warning.main">
                - Rp {fmt(summary?.total_prepaid)}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body1" fontWeight={700}>
                Total Tagihan
              </Typography>
              <Typography variant="body1" fontWeight={700} color="primary.main">
                Rp {fmt(summary?.grand_total)}
              </Typography>
            </Stack>
          </Stack>

          {/* Metode Pembayaran */}
          <TextField
            select
            label="Metode Pembayaran"
            size="small"
            value={paymentMethodId}
            onChange={(e) => setPaymentMethodId(e.target.value)}
            fullWidth
            required
          >
            {paymentMethods.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Action */}
          <Button
            variant="contained"
            color="success"
            size="large"
            fullWidth
            onClick={handlePay}
            disabled={loadingPay || !paymentMethodId}
            startIcon={loadingPay ? <CircularProgress size={18} /> : null}
          >
            Konfirmasi Pembayaran & Selesai
          </Button>
        </Stack>
      )}
    </ModalC>
  );
};

CheckoutBreeding.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.shape({ transactionId: PropTypes.number }),
  onClose: PropTypes.func
};

export default CheckoutBreeding;
