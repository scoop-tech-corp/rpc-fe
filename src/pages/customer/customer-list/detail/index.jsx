import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { useIntl, FormattedMessage } from 'react-intl';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getCustomerDetail } from '../../service';
import axios from 'utils/axios';

import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import PersonIcon from '@mui/icons-material/Person';
import PetsIcon from '@mui/icons-material/Pets';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ChatIcon from '@mui/icons-material/Chat';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import dayjs from 'dayjs';

// ── Helper ────────────────────────────────────────────────────────────────────
const fullName = (d) => [d?.titleCustomerName, d?.firstName, d?.middleName, d?.lastName].filter(Boolean).join(' ') || '-';

const fmt = (val) => (val ? dayjs(val).format('DD MMM YYYY') : '-');
const fmtNum = (val) => new Intl.NumberFormat('id-ID').format(val || 0);

const InfoRow = ({ label, value }) => (
  <Grid container spacing={1} sx={{ mb: 0.5 }}>
    <Grid item xs={5}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Grid>
    <Grid item xs={7}>
      <Typography variant="body2" fontWeight="medium">
        {value || '-'}
      </Typography>
    </Grid>
  </Grid>
);

const SERVICE_COLOR = {
  Klinik: 'primary',
  Hotel: 'secondary',
  Salon: 'warning',
  Petshop: 'success',
  Breeding: 'info'
};

// ── Tab: Data Pribadi ─────────────────────────────────────────────────────────
const TabDataPribadi = ({ data }) => {
  const intl = useIntl();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <FormattedMessage id="identity" />
        </Typography>
        <InfoRow label={intl.formatMessage({ id: 'full-name' })} value={fullName(data)} />
        <InfoRow label={intl.formatMessage({ id: 'nickname' })} value={data.nickName} />
        <InfoRow label={intl.formatMessage({ id: 'gender' })} value={data.gender} />
        <InfoRow label={intl.formatMessage({ id: 'birth-date' })} value={fmt(data.birthDate)} />
        <InfoRow label={intl.formatMessage({ id: 'occupation' })} value={data.occupationName} />
        <InfoRow label={intl.formatMessage({ id: 'id-type' })} value={data.typeIdName} />
        <InfoRow label={intl.formatMessage({ id: 'identity-number' })} value={data.numberId} />
      </Grid>
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <FormattedMessage id="membership" />
        </Typography>
        <InfoRow label={intl.formatMessage({ id: 'card-number' })} value={data.memberNo} />
        <InfoRow label={intl.formatMessage({ id: 'customer-group' })} value={data.customerGroupName} />
        <InfoRow label={intl.formatMessage({ id: 'location' })} value={data.locationName} />
        <InfoRow label={intl.formatMessage({ id: 'join-date' })} value={fmt(data.joinDate)} />
        <InfoRow label={intl.formatMessage({ id: 'reference' })} value={data.referenceCustomerName} />
        <InfoRow label={intl.formatMessage({ id: 'color-type' })} value={data.colorType} />
        {data.notes && (
          <Box mt={1.5}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <FormattedMessage id="note" />
            </Typography>
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
              <Typography variant="body2">{data.notes}</Typography>
            </Box>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

// ── Tab: Kontak & Alamat ──────────────────────────────────────────────────────
const TabKontak = ({ data }) => {
  const intl = useIntl();
  const primaryLabel = intl.formatMessage({ id: 'primary-label' });
  const noContact = intl.formatMessage({ id: 'no-contact' });
  return (
    <Grid container spacing={3}>
      {/* Telepon */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <FormattedMessage id="phone-number" />
        </Typography>
        {!data.telephones || data.telephones.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {noContact}
          </Typography>
        ) : (
          data.telephones.map((t, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center" mb={0.75}>
              {t.type === 'Whatsapp' || t.type === 'WhatsApp' ? (
                <WhatsAppIcon sx={{ fontSize: 15, color: '#25D366' }} />
              ) : (
                <PhoneIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              )}
              <Typography variant="body2">{t.phoneNumber}</Typography>
              {t.usage === 'Utama' && (
                <Chip label={primaryLabel} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
              )}
            </Stack>
          ))
        )}
      </Grid>

      {/* Email */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
          Email
        </Typography>
        {!data.emails || data.emails.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {noContact}
          </Typography>
        ) : (
          data.emails.map((e, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center" mb={0.75}>
              <EmailIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="body2">{e.email}</Typography>
              {e.usage === 'Utama' && (
                <Chip label={primaryLabel} size="small" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
              )}
            </Stack>
          ))
        )}
      </Grid>

      {/* Messenger */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <ChatIcon sx={{ fontSize: 14, mr: 0.5 }} />
          Messenger
        </Typography>
        {!data.messengers || data.messengers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {noContact}
          </Typography>
        ) : (
          data.messengers.map((m, i) => (
            <Stack key={i} direction="row" spacing={1} alignItems="center" mb={0.75}>
              <ChatIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              <Typography variant="body2">{m.messengerNumber}</Typography>
              <Chip label={m.type} size="small" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
            </Stack>
          ))
        )}
      </Grid>

      {/* Alamat */}
      <Grid item xs={12}>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <HomeIcon sx={{ fontSize: 14, mr: 0.5 }} />
          <FormattedMessage id="address" />
        </Typography>
        {!data.detailAddresses || data.detailAddresses.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {noContact}
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {data.detailAddresses.map((a, i) => (
              <Grid item xs={12} md={6} key={i}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
                  {a.isPrimary === 1 && <Chip label={primaryLabel} size="small" color="primary" sx={{ mb: 1, height: 20, fontSize: 10 }} />}
                  <Typography variant="body2" fontWeight="medium">
                    {a.addressName}
                  </Typography>
                  {a.additionalInfo && (
                    <Typography variant="body2" color="text.secondary">
                      {a.additionalInfo}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {[a.cityCode, a.provinceCode, a.postalCode, a.country].filter(Boolean).join(', ')}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>

      {/* Foto */}
      {data.images && data.images.length > 0 && (
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
            <FormattedMessage id="photo" />
          </Typography>
          <Stack direction="row" spacing={1.5} flexWrap="wrap">
            {data.images.map((img) => (
              <Box key={img.id} sx={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.open(img.imagePath, '_blank')}>
                <Box
                  component="img"
                  src={img.imagePath}
                  alt={img.labelName}
                  sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {img.labelName && (
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    {img.labelName}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Grid>
      )}
    </Grid>
  );
};

// ── Tab: Hewan Peliharaan ─────────────────────────────────────────────────────
const TabPet = ({ data }) => {
  const intl = useIntl();
  if (!data.customerPets || data.customerPets.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        <FormattedMessage id="no-pet-data" />
      </Typography>
    );
  }
  return (
    <Grid container spacing={2}>
      {data.customerPets.map((pet) => (
        <Grid item xs={12} sm={6} md={4} key={pet.id}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
              <Avatar sx={{ bgcolor: 'primary.lighter', width: 36, height: 36 }}>
                <PetsIcon color="primary" fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {pet.petName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {pet.petCategoryName}
                </Typography>
              </Box>
              {pet.petGender === 'Male' || pet.petGender === 'Jantan' ? (
                <MaleIcon sx={{ ml: 'auto', color: 'primary.main', fontSize: 18 }} />
              ) : (
                <FemaleIcon sx={{ ml: 'auto', color: 'error.main', fontSize: 18 }} />
              )}
            </Stack>
            <Divider sx={{ mb: 1 }} />
            <InfoRow label={intl.formatMessage({ id: 'race' })} value={pet.races} />
            <InfoRow label={intl.formatMessage({ id: 'color' })} value={pet.color} />
            <InfoRow label={intl.formatMessage({ id: 'condition' })} value={pet.condition} />
            <InfoRow
              label={intl.formatMessage({ id: 'sterilized' })}
              value={pet.isSteril ? intl.formatMessage({ id: 'yes' }) : intl.formatMessage({ id: 'no' })}
            />
            {pet.dateOfBirth ? (
              <InfoRow label={intl.formatMessage({ id: 'birth-date' })} value={fmt(pet.dateOfBirth)} />
            ) : (
              <InfoRow
                label={intl.formatMessage({ id: 'age' })}
                value={[
                  pet.petYear && `${pet.petYear} ${intl.formatMessage({ id: 'years' })}`,
                  pet.petMonth && `${pet.petMonth} ${intl.formatMessage({ id: 'months' })}`
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            )}
            {pet.remark && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {pet.remark}
              </Typography>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

// ── Fetch detail transaksi berdasarkan serviceType ────────────────────────────
const fetchTransactionDetail = async (serviceType, transactionId) => {
  const map = {
    Klinik: () => axios.get('transaction/petclinic/beforepayment', { params: { transactionPetClinicId: transactionId } }),
    Hotel: () => axios.get('transaction/pethotel/beforepayment', { params: { transactionId } }),
    Salon: () => axios.get('transaction/petsalon/beforepayment', { params: { transactionId } }),
    Breeding: () => axios.get('transaction/breeding/beforepayment', { params: { transactionId } }),
    Petshop: () => axios.get('transaction/petshop/detail', { params: { transactionId } })
  };
  const fn = map[serviceType];
  if (!fn) return null;
  const resp = await fn();
  return resp.data;
};

// ── Detail item (expand content) ─────────────────────────────────────────────
const TransactionDetailExpand = ({ serviceType, transactionId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionDetail(serviceType, transactionId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [serviceType, transactionId]);

  if (loading)
    return (
      <Box sx={{ py: 1.5, pl: 4 }}>
        <CircularProgress size={18} />
      </Box>
    );

  if (!detail)
    return (
      <Box sx={{ py: 1, pl: 4 }}>
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage id="no-detail-data" />
        </Typography>
      </Box>
    );

  // Normalkan data — tiap tipe punya struktur sedikit berbeda
  const services = detail?.data?.services || detail?.services || [];
  const products = detail?.data?.products || detail?.products || [];
  const recipes = detail?.data?.recipes || []; // khusus klinik

  const hasItems = services.length > 0 || products.length > 0 || recipes.length > 0;

  if (!hasItems)
    return (
      <Box sx={{ py: 1, pl: 4 }}>
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage id="no-items-recorded" />
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ bgcolor: 'action.hover', px: 3, py: 1.5 }}>
      <Table size="small" sx={{ '& td, & th': { borderBottom: 'none', py: 0.5 } }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 'bold', pl: 0 }}>
              <FormattedMessage id="item" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 'bold' }}>
              <FormattedMessage id="type" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 'bold' }} align="right">
              <FormattedMessage id="qty" />
            </TableCell>
            <TableCell sx={{ color: 'text.secondary', fontSize: 11, fontWeight: 'bold' }} align="right">
              <FormattedMessage id="price" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((s, i) => (
            <TableRow key={`s-${i}`}>
              <TableCell sx={{ pl: 0 }}>
                <Typography variant="caption">{s.serviceName}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={<FormattedMessage id="service-layanan" />}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10 }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">{s.quantity}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">Rp {fmtNum(s.basedPrice)}</Typography>
              </TableCell>
            </TableRow>
          ))}
          {products.map((p, i) => (
            <TableRow key={`p-${i}`}>
              <TableCell sx={{ pl: 0 }}>
                <Typography variant="caption">{p.productName || p.item_name}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={p.productType || <FormattedMessage id="product" />}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10 }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">{p.quantity}</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">Rp {fmtNum(p.basedPrice || p.unit_price)}</Typography>
              </TableCell>
            </TableRow>
          ))}
          {recipes.map((r, i) => (
            <TableRow key={`r-${i}`}>
              <TableCell sx={{ pl: 0 }}>
                <Typography variant="caption">{r.productName}</Typography>
                {r.dosage && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {r.dosage} {r.unit} · {r.frequency}x · {r.duration} <FormattedMessage id="days" />
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Chip
                  label={<FormattedMessage id="recipe" />}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 18, fontSize: 10 }}
                />
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">-</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption">Rp {fmtNum(r.basedPrice)}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

// ── Tab: Riwayat Transaksi ────────────────────────────────────────────────────
const TabTransaksi = ({ data }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggle = (key) => setExpandedRow((prev) => (prev === key ? null : key));

  if (!data.visitHistory || data.visitHistory.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        <FormattedMessage id="no-transaction-history" />
      </Typography>
    );
  }

  return (
    <>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        <FormattedMessage id="transaction-list-hint" />
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell width={32} />
            <TableCell>
              <strong>
                <FormattedMessage id="registration-no" />
              </strong>
            </TableCell>
            <TableCell>
              <strong>
                <FormattedMessage id="service-layanan" />
              </strong>
            </TableCell>
            <TableCell>
              <strong>
                <FormattedMessage id="pet-animal" />
              </strong>
            </TableCell>
            <TableCell>
              <strong>
                <FormattedMessage id="date" />
              </strong>
            </TableCell>
            <TableCell>
              <strong>
                <FormattedMessage id="status" />
              </strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.visitHistory.map((v) => {
            const key = `${v.serviceType}-${v.id}`;
            const isOpen = expandedRow === key;
            return (
              <React.Fragment key={key}>
                <TableRow hover onClick={() => toggle(key)} sx={{ cursor: 'pointer', bgcolor: isOpen ? 'action.selected' : 'inherit' }}>
                  <TableCell padding="checkbox">
                    <IconButton size="small">
                      {isOpen ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {v.registrationNo || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={v.serviceType} size="small" color={SERVICE_COLOR[v.serviceType] || 'default'} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{v.petName || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{v.startDate ? fmt(v.startDate) : fmt(v.createdAt)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={v.status || '-'} size="small" variant="outlined" />
                  </TableCell>
                </TableRow>

                <TableRow key={`${key}-detail`}>
                  <TableCell colSpan={6} sx={{ p: 0, borderBottom: isOpen ? undefined : 'none' }}>
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <TransactionDetailExpand serviceType={v.serviceType} transactionId={v.id} />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

// ── Tab: Statistik ────────────────────────────────────────────────────────────
const TabStatistik = ({ data }) => {
  const intl = useIntl();
  const summary = data.transactionSummary || {};
  const stats = [
    {
      label: intl.formatMessage({ id: 'total-transaction' }),
      value: fmtNum(summary.totalTransaction),
      color: 'primary',
      icon: <ReceiptLongIcon />
    },
    {
      label: intl.formatMessage({ id: 'total-booking' }),
      value: fmtNum(summary.totalBooking),
      color: 'secondary',
      icon: <ReceiptLongIcon />
    },
    {
      label: intl.formatMessage({ id: 'total-spending' }),
      value: `Rp ${fmtNum(summary.totalSpending)}`,
      color: 'success',
      icon: <BarChartIcon />
    }
  ];
  return (
    <Grid container spacing={2}>
      {stats.map((s) => (
        <Grid item xs={12} sm={4} key={s.label}>
          <Box
            sx={{
              border: '1px solid',
              borderColor: `${s.color}.light`,
              borderRadius: 2,
              p: 2.5,
              textAlign: 'center',
              bgcolor: `${s.color}.lighter`
            }}
          >
            <Box sx={{ color: `${s.color}.main`, mb: 1 }}>{s.icon}</Box>
            <Typography variant="h5" fontWeight="bold" color={`${s.color}.main`}>
              {s.value}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {s.label}
            </Typography>
          </Box>
        </Grid>
      ))}

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary.main">
          <FormattedMessage id="other-info" />
        </Typography>
        <InfoRow
          label={intl.formatMessage({ id: 'last-transaction' })}
          value={data.lastTransactionDate ? dayjs(data.lastTransactionDate).format('DD MMM YYYY HH:mm') : '-'}
        />
        <InfoRow label={intl.formatMessage({ id: 'total-pet' })} value={fmtNum(data.customerPets?.length)} />
        <InfoRow
          label={intl.formatMessage({ id: 'reminder-booking' })}
          value={data.isReminderBooking ? intl.formatMessage({ id: 'active' }) : intl.formatMessage({ id: 'inactive' })}
        />
        <InfoRow
          label={intl.formatMessage({ id: 'reminder-payment' })}
          value={data.isReminderPayment ? intl.formatMessage({ id: 'active' }) : intl.formatMessage({ id: 'inactive' })}
        />
      </Grid>
    </Grid>
  );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
const CustomerDetailModal = ({ open, customerId, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!open || !customerId) return;
    setTab(0);
    setData(null);
    setLoading(true);
    getCustomerDetail(customerId)
      .then((resp) => setData(resp.data))
      .catch((err) => dispatch(snackbarError(createMessageBackend(err))))
      .finally(() => setLoading(false));
  }, [open, customerId, dispatch]);

  const handleEdit = () => {
    onClose();
    navigate(`/customer/list/form/${customerId}`);
  };

  const handleMerge = () => {
    onClose();
    navigate('/customer/merge');
  };

  const TABS = [
    { label: intl.formatMessage({ id: 'personal-data' }), icon: <PersonIcon fontSize="small" /> },
    { label: intl.formatMessage({ id: 'contact-address' }), icon: <PhoneIcon fontSize="small" /> },
    { label: intl.formatMessage({ id: 'pets' }), icon: <PetsIcon fontSize="small" /> },
    { label: intl.formatMessage({ id: 'transaction-history' }), icon: <ReceiptLongIcon fontSize="small" /> },
    { label: intl.formatMessage({ id: 'statistics' }), icon: <BarChartIcon fontSize="small" /> }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper">
      {/* ── Header ── */}
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44, fontSize: 18 }}>
            {data?.firstName?.[0]?.toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box flex={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight="bold">
                {data ? fullName(data) : '...'}
              </Typography>
              {data?.memberNo && <Chip label={`# ${data.memberNo}`} size="small" color="primary" variant="outlined" />}
            </Stack>
            <Stack direction="row" spacing={1} mt={0.25}>
              {data?.customerGroupName && (
                <Typography variant="caption" color="text.secondary">
                  {data.customerGroupName}
                </Typography>
              )}
              {data?.customerGroupName && data?.locationName && (
                <Typography variant="caption" color="text.disabled">
                  ·
                </Typography>
              )}
              {data?.locationName && (
                <Typography variant="caption" color="text.secondary">
                  {data.locationName}
                </Typography>
              )}
            </Stack>
          </Box>
          <Tooltip title={intl.formatMessage({ id: 'close' })}>
            <IconButton onClick={onClose} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mt: 1.5, borderBottom: 1, borderColor: 'divider' }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} sx={{ minHeight: 40, py: 0.5 }} />
          ))}
        </Tabs>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent sx={{ minHeight: 350, pt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : data ? (
          <>
            {tab === 0 && <TabDataPribadi data={data} />}
            {tab === 1 && <TabKontak data={data} />}
            {tab === 2 && <TabPet data={data} />}
            {tab === 3 && <TabTransaksi data={data} />}
            {tab === 4 && <TabStatistik data={data} />}
          </>
        ) : null}
      </DialogContent>

      {/* ── Footer ── */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button variant="outlined" startIcon={<MergeTypeIcon />} onClick={handleMerge} color="warning">
          <FormattedMessage id="customer-merge" />
        </Button>
        <Box flex={1} />
        <Button variant="outlined" onClick={onClose}>
          <FormattedMessage id="close" />
        </Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={handleEdit}>
          <FormattedMessage id="edit-customer" />
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomerDetailModal;
