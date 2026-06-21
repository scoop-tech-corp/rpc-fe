import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createMessageBackend } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { selfSubmitSupportRequest, getMyRequests } from '../service';

import MainCard from 'components/MainCard';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';

const STATUS_COLORS = {
  open: 'warning',
  in_progress: 'info',
  closed: 'success'
};

const statusLabel = (s) => {
  if (s === 'open') return 'Terbuka';
  if (s === 'in_progress') return 'Sedang Ditangani';
  if (s === 'closed') return 'Selesai';
  return s;
};

const defaultForm = { subject: '', message: '' };

const CustomerSupportPortal = () => {
  const dispatch = useDispatch();

  const [tab, setTab] = useState(0);
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const fetchMyRequests = async () => {
    setListLoading(true);
    try {
      const resp = await getMyRequests({ rowPerPage: 20, goToPage: 1 });
      setMyRequests(resp.data.data || []);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 1) fetchMyRequests();
  }, [tab]); // eslint-disable-line

  const onSubmit = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) return;
    setSubmitting(true);
    try {
      await selfSubmitSupportRequest(formData);
      dispatch(snackbarSuccess('Pengajuan bantuan berhasil dikirim!'));
      setSubmitted(true);
      setFormData(defaultForm);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const onNewRequest = () => setSubmitted(false);

  return (
    <>
      <HeaderPageCustom title="Pusat Bantuan" />

      <MainCard content={false}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
            <Tab label="Ajukan Bantuan" />
            <Tab label="Pengajuan Saya" />
          </Tabs>
        </Box>

        {/* ── Tab 0: Form Submit ──────────────────────────────────────────── */}
        {tab === 0 && (
          <Box sx={{ p: 3, maxWidth: 560 }}>
            {submitted ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CheckCircleOutlined style={{ fontSize: 56, color: '#52c41a' }} />
                <Typography variant="h5">Pengajuan Terkirim!</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Tim kami akan segera menindaklanjuti pengajuan Anda. Pantau status di tab <strong>Pengajuan Saya</strong>.
                </Typography>
                <Button variant="outlined" startIcon={<PlusOutlined />} onClick={onNewRequest}>
                  Buat Pengajuan Baru
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2.5}>
                <Typography variant="body2" color="text.secondary">
                  Sampaikan kendala atau pertanyaan Anda. Kami akan merespons secepatnya.
                </Typography>

                <TextField
                  label="Perihal / Topik *"
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  placeholder="Contoh: Pertanyaan jadwal grooming"
                  size="small"
                  fullWidth
                  inputProps={{ maxLength: 255 }}
                />

                <TextField
                  label="Detail Pesan *"
                  value={formData.message}
                  onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Jelaskan kendala atau pertanyaan Anda secara lengkap..."
                  multiline
                  rows={5}
                  size="small"
                  fullWidth
                />

                <Button
                  variant="contained"
                  size="large"
                  onClick={onSubmit}
                  disabled={!formData.subject.trim() || !formData.message.trim() || submitting}
                  startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <PlusOutlined />}
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                </Button>
              </Stack>
            )}
          </Box>
        )}

        {/* ── Tab 1: My Requests ─────────────────────────────────────────── */}
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {listLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : myRequests.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Belum ada pengajuan bantuan
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {myRequests.map((r) => (
                  <Card key={r.id} variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {r.subject}
                        </Typography>
                        <Chip label={statusLabel(r.status)} color={STATUS_COLORS[r.status] || 'default'} size="small" />
                      </Stack>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                        {r.message}
                      </Typography>

                      <Divider sx={{ mb: 1 }} />

                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Typography variant="caption" color="text.secondary">
                          📅 Dibuat: {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}
                        </Typography>
                        {r.locationName && (
                          <Typography variant="caption" color="text.secondary">
                            📍 {r.locationName}
                          </Typography>
                        )}
                        {r.handledByName?.trim() && (
                          <Typography variant="caption" color="text.secondary">
                            👤 Ditangani: {r.handledByName}
                          </Typography>
                        )}
                        {r.resolvedAt && (
                          <Typography variant="caption" color="success.main">
                            ✅ Selesai: {new Date(r.resolvedAt).toLocaleDateString('id-ID')}
                          </Typography>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </MainCard>
    </>
  );
};

export default CustomerSupportPortal;
