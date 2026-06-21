import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
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
import { addAdditionalTreatment, getAdditionalTreatments, getAvailableItems } from '../../service';

const AdditionalTreatment = (props) => {
  const { data } = props;
  const dispatch = useDispatch();

  const [rows, setRows] = useState([]);
  const [type, setType] = useState('service');
  const [itemOptions, setItemOptions] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [catatan, setCatatan] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loadingItems, setLoadingItems] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchRows = async () => {
    await getAdditionalTreatments(data.transactionId)
      .then((resp) => {
        if (resp?.data) setRows(resp.data);
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setSelectedItem(null);
    setItemOptions([]);
    setSearchInput('');
  }, [type]);

  const loadItems = async (search = '') => {
    setLoadingItems(true);
    await getAvailableItems(data.transactionId, type, search)
      .then((resp) => {
        if (resp?.data) setItemOptions(resp.data);
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setLoadingItems(false));
  };

  const onSubmit = async () => {
    if (!selectedItem || quantity < 1) return;
    setSubmitting(true);
    await addAdditionalTreatment({
      transactionId: data.transactionId,
      type,
      itemId: selectedItem.id,
      quantity,
      catatan
    })
      .then((resp) => {
        if (resp?.status === 201 || resp?.status === 200) {
          dispatch(snackbarSuccess('Treatment tambahan berhasil ditambahkan'));
          setSelectedItem(null);
          setQuantity(1);
          setCatatan('');
          setSearchInput('');
          fetchRows();
        }
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <ModalC
      title="Treatment Tambahan Selama Menginap"
      open={props.open}
      onCancel={() => props.onClose(false)}
      isModalAction={false}
      fullWidth
      maxWidth="md"
    >
      <Stack spacing={2.5}>
        {/* Form tambah */}
        <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
            Tambah Treatment
          </Typography>

          <FormControl component="fieldset">
            <FormLabel component="legend">Jenis</FormLabel>
            <RadioGroup row value={type} onChange={(e) => setType(e.target.value)}>
              <FormControlLabel value="service" control={<Radio size="small" />} label="Layanan / Service" />
              <FormControlLabel value="product" control={<Radio size="small" />} label="Produk" />
            </RadioGroup>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={1.5}>
            <Autocomplete
              sx={{ flex: 2 }}
              options={itemOptions}
              getOptionLabel={(o) => `${o.name} — ${formatCurrency(o.price)}`}
              value={selectedItem}
              inputValue={searchInput}
              loading={loadingItems}
              onOpen={() => loadItems(searchInput)}
              onInputChange={(_, val) => {
                setSearchInput(val);
                loadItems(val);
              }}
              onChange={(_, val) => setSelectedItem(val)}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cari item"
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingItems && <CircularProgress size={16} />}
                        {params.InputProps.endAdornment}
                      </>
                    )
                  }}
                />
              )}
            />
            <TextField
              label="Jumlah"
              type="number"
              size="small"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, +e.target.value))}
              inputProps={{ min: 1, step: 1 }}
              sx={{ width: 100 }}
            />
            <TextField
              label="Catatan (opsional)"
              size="small"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={onSubmit}
              disabled={!selectedItem || quantity < 1 || submitting}
              sx={{ alignSelf: 'center', whiteSpace: 'nowrap' }}
            >
              {submitting ? 'Menyimpan...' : 'Tambah'}
            </Button>
          </Stack>
        </Box>

        <Divider />

        {/* Tabel daftar */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 'bold' } }}>
                <TableCell>Item</TableCell>
                <TableCell>Jenis</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Harga Satuan</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Catatan</TableCell>
                <TableCell>Ditambah Oleh</TableCell>
                <TableCell>Waktu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.itemName}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.type === 'service' ? 'Layanan' : 'Produk'}
                      size="small"
                      color={row.type === 'service' ? 'info' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">{row.quantity}</TableCell>
                  <TableCell align="right">{formatCurrency(row.price)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.total)}</TableCell>
                  <TableCell>{row.catatan || '-'}</TableCell>
                  <TableCell>{row.addedBy}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.addedAt}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Belum ada treatment tambahan
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </ModalC>
  );
};

AdditionalTreatment.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default AdditionalTreatment;
