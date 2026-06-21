import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import {
  Alert,
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { AlignCenterOutlined, DownloadOutlined, PlusOutlined, UndoOutlined, UploadOutlined } from '@ant-design/icons';
import DownloadIcon from '@mui/icons-material/Download';
import useAuth from 'hooks/useAuth';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import { ReactTable } from 'components/third-party/ReactTable';
import { createMessageBackend, getLocationList, processDownloadExcel } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { getCageList, createCage, exportCage, downloadImportTemplate, importCage } from './service';
import useGetList from 'hooks/useGetList';

const TYPE_OPTIONS = ['hotel', 'breeding', 'salon', 'general'];
const SIZE_OPTIONS = ['S', 'M', 'L', 'XL'];
const COND_OPTIONS = [
  { label: 'Baik', value: 'baik' },
  { label: 'Perlu Perhatian', value: 'perlu_perhatian' },
  { label: 'Tidak Layak', value: 'tidak_layak' }
];
const STATUS_OPTIONS = [
  { label: 'Aktif', value: '1' },
  { label: 'Nonaktif', value: '0' }
];

const conditionColor = { baik: 'success', perlu_perhatian: 'warning', tidak_layak: 'error' };
const conditionLabel = { baik: 'Baik', perlu_perhatian: 'Perlu Perhatian', tidak_layak: 'Tidak Layak' };
const typeLabel = { hotel: 'Hotel', breeding: 'Breeding', salon: 'Salon', general: 'General' };

const defaultFilter = { locationId: [], type: [], conditionStatus: [], status: '' };
const defaultForm = {
  locationId: '',
  cageName: '',
  type: 'hotel',
  size: '',
  status: '1',
  conditionStatus: 'baik',
  capacity: 1,
  amount: 1,
  notes: ''
};

export default function CageManagement() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const role = user?.role?.toLowerCase() ?? '';
  const isAdminOrManager = ['administrator', 'manager'].includes(role);

  const [locationList, setLocationList] = useState([]);
  const [filter, setFilter] = useState(defaultFilter);
  const [isShowFilter, setIsShowFilter] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);

  // Import state
  const fileInputRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { inserted, skipped, errors }
  const [openImportResult, setOpenImportResult] = useState(false);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, changeLimit } = useGetList(getCageList, {}, 'search');

  useEffect(() => {
    getLocationList()
      .then(setLocationList)
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  }, [dispatch]);

  const handleFilter = () => {
    setParams((p) => ({
      ...p,
      locationId: filter.locationId.map((x) => x.value).join(','),
      type: filter.type.join(','),
      conditionStatus: filter.conditionStatus.map((x) => x.value).join(','),
      status: filter.status?.value ?? ''
    }));
  };

  const handleReset = () => {
    setFilter(defaultFilter);
    setParams((p) => ({ ...p, locationId: '', type: '', conditionStatus: '', status: '' }));
  };

  const f = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  // ── Export ──────────────────────────────────────────────────
  const onExport = async () => {
    await exportCage({
      search: params.search ?? '',
      locationId: params.locationId ?? '',
      type: params.type ?? '',
      conditionStatus: params.conditionStatus ?? '',
      status: params.status ?? ''
    })
      .then(processDownloadExcel)
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  // ── Download Template ────────────────────────────────────────
  const onDownloadTemplate = async () => {
    await downloadImportTemplate()
      .then(processDownloadExcel)
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))));
  };

  // ── Import ───────────────────────────────────────────────────
  const onFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset agar bisa upload file sama

    setImporting(true);
    await importCage(file)
      .then((res) => {
        setImportResult(res.data);
        setOpenImportResult(true);
        setParams((p) => ({ ...p })); // trigger refetch
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setImporting(false));
  };

  const onSubmitCreate = async () => {
    if (!form.locationId || !form.cageName || !form.type || !form.capacity || !form.amount) {
      dispatch(snackbarError('Lokasi, nama kandang, tipe, kapasitas, dan jumlah wajib diisi'));
      return;
    }
    setSubmitting(true);
    await createCage({
      ...form,
      locationId: form.locationId?.value ?? form.locationId
    })
      .then(() => {
        dispatch(snackbarSuccess('Kandang berhasil ditambahkan'));
        setOpenForm(false);
        setForm(defaultForm);
        setParams((p) => ({ ...p })); // trigger refetch
      })
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setSubmitting(false));
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Nama Kandang',
        accessor: 'cageName',
        Cell: ({ row }) => (
          <Button variant="text" size="small" onClick={() => navigate(`/location/cage-management/${row.original.id}`)}>
            {row.original.cageName}
          </Button>
        )
      },
      { Header: 'Lokasi', accessor: 'locationName' },
      {
        Header: 'Tipe',
        accessor: 'type',
        Cell: ({ value }) => <Chip size="small" label={typeLabel[value] ?? value} />
      },
      {
        Header: 'Ukuran',
        accessor: 'size',
        Cell: ({ value }) => (value ? <Chip size="small" label={value} variant="outlined" /> : '-')
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => <Chip size="small" label={+value === 1 ? 'Aktif' : 'Nonaktif'} color={+value === 1 ? 'success' : 'default'} />
      },
      {
        Header: 'Kondisi',
        accessor: 'conditionStatus',
        Cell: ({ value }) => <Chip size="small" label={conditionLabel[value] ?? value} color={conditionColor[value] ?? 'default'} />
      },
      {
        Header: 'Occupancy',
        accessor: 'isOccupied',
        Cell: ({ row }) => {
          const { isOccupied, occupantPet, occupantCustomer, occupantType } = row.original;
          if (!isOccupied) return <Chip size="small" label="Kosong" color="default" />;
          return (
            <Tooltip title={`${occupantPet} — ${occupantCustomer} (${occupantType})`}>
              <Chip size="small" label={`Terisi — ${occupantPet}`} color="error" />
            </Tooltip>
          );
        }
      }
    ],
    [navigate]
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="cage-management" />} isBreadcrumb />

      <MainCard content={false}>
        <ScrollX>
          <Stack spacing={3}>
            {/* Toolbar */}
            <Stack direction={matchDownSM ? 'column' : 'row'} justifyContent="flex-end" spacing={1} sx={{ p: 3, pb: 0 }} flexWrap="wrap">
              {/* Hidden file input for import */}
              <input type="file" accept=".xlsx,.xls" ref={fileInputRef} style={{ display: 'none' }} onChange={onFileSelected} />

              {isAdminOrManager && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm(true)}>
                  Tambah Kandang
                </Button>
              )}

              <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={onExport}>
                Export
              </Button>

              <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={onDownloadTemplate}>
                Template Import
              </Button>

              {isAdminOrManager && (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<UploadOutlined />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                >
                  {importing ? 'Mengimport...' : 'Import Excel'}
                </Button>
              )}

              <Button variant="contained" color="info" startIcon={<AlignCenterOutlined />} onClick={() => setIsShowFilter((v) => !v)}>
                <FormattedMessage id="filter" />
              </Button>
            </Stack>

            {/* Filter panel */}
            {isShowFilter && (
              <Stack direction={matchDownSM ? 'column' : 'row'} spacing={1} sx={{ px: 3 }} flexWrap="wrap">
                <Autocomplete
                  multiple
                  limitTags={1}
                  options={locationList}
                  value={filter.locationId}
                  sx={{ minWidth: 220 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => setFilter((f) => ({ ...f, locationId: v }))}
                  renderInput={(p) => <TextField {...p} label="Lokasi" size="small" />}
                />
                <Autocomplete
                  multiple
                  limitTags={1}
                  options={TYPE_OPTIONS}
                  value={filter.type}
                  sx={{ minWidth: 180 }}
                  onChange={(_, v) => setFilter((f) => ({ ...f, type: v }))}
                  renderInput={(p) => <TextField {...p} label="Tipe" size="small" />}
                />
                <Autocomplete
                  multiple
                  limitTags={1}
                  options={COND_OPTIONS}
                  value={filter.conditionStatus}
                  sx={{ minWidth: 200 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => setFilter((f) => ({ ...f, conditionStatus: v }))}
                  renderInput={(p) => <TextField {...p} label="Kondisi" size="small" />}
                />
                <Autocomplete
                  options={STATUS_OPTIONS}
                  value={filter.status}
                  sx={{ minWidth: 160 }}
                  isOptionEqualToValue={(o, v) => o.value === v.value}
                  onChange={(_, v) => setFilter((f) => ({ ...f, status: v }))}
                  renderInput={(p) => <TextField {...p} label="Status" size="small" />}
                />
                <Button variant="outlined" startIcon={<UndoOutlined />} onClick={handleReset}>
                  Reset
                </Button>
                <Button variant="outlined" startIcon={<AlignCenterOutlined />} onClick={handleFilter}>
                  Filter
                </Button>
              </Stack>
            )}

            {/* Table */}
            <ReactTable
              columns={columns}
              data={list || []}
              totalPagination={totalPagination}
              setPageNumber={params.goToPage}
              setPageRow={params.rowPerPage}
              onGotoPage={goToPage}
              onOrder={orderingChange}
              onPageSize={changeLimit}
            />
          </Stack>
        </ScrollX>
      </MainCard>

      {/* Dialog Hasil Import */}
      <Dialog open={openImportResult} onClose={() => setOpenImportResult(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hasil Import Kandang</DialogTitle>
        <DialogContent dividers>
          {importResult && (
            <Stack spacing={2}>
              <Alert severity={importResult.errors?.length ? 'warning' : 'success'}>
                <strong>{importResult.inserted}</strong> kandang berhasil ditambahkan,&nbsp;
                <strong>{importResult.skipped}</strong> dilewati (sudah ada),&nbsp;
                <strong>{importResult.errors?.length ?? 0}</strong> baris error.
              </Alert>

              {importResult.errors?.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="error">
                    Detail Error:
                  </Typography>
                  <List dense disablePadding sx={{ maxHeight: 280, overflow: 'auto' }}>
                    {importResult.errors.map((e, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText
                          primary={`Baris ${e.row}`}
                          secondary={e.errors.join(' | ')}
                          primaryTypographyProps={{ fontWeight: 600, color: 'error.main' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setOpenImportResult(false)}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Tambah Kandang */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Kandang Baru</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Autocomplete
              options={locationList}
              value={form.locationId || null}
              isOptionEqualToValue={(o, v) => o.value === v?.value}
              onChange={(_, v) => f('locationId', v)}
              renderInput={(p) => <TextField {...p} label="Lokasi *" size="small" />}
            />

            <TextField
              label="Nama Kandang *"
              size="small"
              inputProps={{ maxLength: 100 }}
              value={form.cageName}
              onChange={(e) => f('cageName', e.target.value)}
            />

            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Tipe *</InputLabel>
                <Select label="Tipe *" value={form.type} onChange={(e) => f('type', e.target.value)}>
                  {TYPE_OPTIONS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {typeLabel[t]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Ukuran</InputLabel>
                <Select label="Ukuran" value={form.size} onChange={(e) => f('size', e.target.value)}>
                  <MenuItem value="">
                    <em>Tidak dipilih</em>
                  </MenuItem>
                  {SIZE_OPTIONS.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status *</InputLabel>
                <Select label="Status *" value={form.status} onChange={(e) => f('status', e.target.value)}>
                  <MenuItem value="1">Aktif</MenuItem>
                  <MenuItem value="0">Nonaktif</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" fullWidth>
                <InputLabel>Kondisi Awal</InputLabel>
                <Select label="Kondisi Awal" value={form.conditionStatus} onChange={(e) => f('conditionStatus', e.target.value)}>
                  <MenuItem value="baik">Baik</MenuItem>
                  <MenuItem value="perlu_perhatian">Perlu Perhatian</MenuItem>
                  <MenuItem value="tidak_layak">Tidak Layak</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Kapasitas *"
                size="small"
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
                value={form.capacity}
                onChange={(e) => f('capacity', e.target.value)}
              />
              <TextField
                label="Jumlah Unit *"
                size="small"
                type="number"
                fullWidth
                inputProps={{ min: 1 }}
                value={form.amount}
                onChange={(e) => f('amount', e.target.value)}
              />
            </Stack>

            <TextField
              label="Catatan"
              size="small"
              multiline
              rows={2}
              inputProps={{ maxLength: 300 }}
              value={form.notes}
              onChange={(e) => f('notes', e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Batal</Button>
          <Button variant="contained" onClick={onSubmitCreate} disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
