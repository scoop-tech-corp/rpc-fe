import { DeleteFilled, PrinterOutlined, PlusOutlined } from '@ant-design/icons';
import DownloadIcon from '@mui/icons-material/Download';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StoreIcon from '@mui/icons-material/Store';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Grid,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import ConfirmationC from 'components/ConfirmationC';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { CONSTANT_ADMINISTRATOR, CONSTANT_STAFF, isAdminOrManager } from 'constant/role';
import useAuth from 'hooks/useAuth';
import useGetList from 'hooks/useGetList';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import {
  createMessageBackend,
  getCustomerGroupList,
  getLocationList,
  processDownloadExcel,
  processDownloadPDF
} from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { formatThousandSeparator } from 'utils/func';
import { GlobalFilter } from 'utils/react-table';
import {
  deletePetShopTransaction,
  exportPetShopTransaction,
  generateInvoicePetShopTransaction,
  getPetShopTransactionIndex
} from 'pages/transaction/service';
import TransactionDetailPetShop from './detail';
import FormTransactionPetShop from './form-transaction';

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, sub }) => (
  <Card variant="outlined" sx={{ borderLeft: 4, borderColor: `${color}.main`, height: '100%' }}>
    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5}>
        <Box sx={{ color: `${color}.main`, display: 'flex', mt: 0.25 }}>{icon}</Box>
        <Box>
          <Typography variant="h5" fontWeight="bold" color={`${color}.main`}>
            {value ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          {sub && (
            <Typography variant="caption" display="block" color="text.disabled">
              {sub}
            </Typography>
          )}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// ── Main Component ────────────────────────────────────────────────────────────
const TransactionPetShop = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const intl = useIntl();

  const isAdmin = user?.role === CONSTANT_ADMINISTRATOR;
  const isAdminMgr = isAdminOrManager(user?.role);
  const canAdd = isAdminMgr || user?.role === CONSTANT_STAFF;

  const { list, totalPagination, params, goToPage, setParams, orderingChange, keyword, changeKeyword, changeLimit } = useGetList(
    getPetShopTransactionIndex,
    { locationId: [], customerGroupId: [] },
    'search'
  );

  const [formConfig, setFormConfig] = useState({ isOpen: false, id: null });
  const [detailConfig, setDetailConfig] = useState({ isOpen: false, data: { id: null } });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [filterLocationList, setFilterLocationList] = useState([]);
  const [selectedFilterLocation, setFilterLocation] = useState([]);
  const [filterCustomerGroupList, setFilterCustomerGroupList] = useState([]);
  const [selectedFilterCustomerGroup, setFilterCustomerGroup] = useState([]);
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    Promise.all([getLocationList(), getCustomerGroupList()]).then(([locs, groups]) => {
      setFilterLocationList(locs);
      setFilterCustomerGroupList(groups);
    });
  }, []);

  // Compute stats from current page data
  const stats = useMemo(() => {
    const l = list || [];
    const totalItems = l.reduce((sum, r) => sum + (+r.totalItem || 0), 0);
    const promoCount = l.filter((r) => +r.totalUsePromo > 0).length;
    return { totalTransaksi: totalPagination || 0, totalItems, promoCount };
  }, [list, totalPagination]);

  const onExport = async () => {
    try {
      await exportPetShopTransaction(params).then(processDownloadExcel);
      dispatch(snackbarSuccess('Export berhasil'));
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onPrintInvoice = async (id, registrationNo) => {
    try {
      const resp = await generateInvoicePetShopTransaction(id);
      processDownloadPDF(resp, `nota-petshop-${registrationNo || id}`);
    } catch (err) {
      dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  const onDelete = async (confirmed) => {
    if (confirmed) {
      try {
        await deletePetShopTransaction(selectedRow);
        dispatch(snackbarSuccess(`${selectedRow.length} transaksi berhasil dihapus`));
        setDeleteDialog(false);
        setSelectedRow([]);
        setParams((p) => ({ ...p }));
      } catch (err) {
        dispatch(snackbarError(createMessageBackend(err)));
      }
    } else {
      setDeleteDialog(false);
    }
  };

  const applyAdvancedFilter = () => {
    setParams((p) => ({ ...p, dateFrom: filterDateFrom, dateTo: filterDateTo }));
  };

  const resetAdvancedFilter = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setParams((p) => ({ ...p, dateFrom: '', dateTo: '' }));
  };

  const hasAdvancedFilter = !!(filterDateFrom || filterDateTo);

  // ── Column definitions ──────────────────────────────────────────────────────
  const columnCheckbox = () =>
    isAdmin
      ? [
          {
            title: 'Row Selection',
            Header: (header) => {
              useEffect(() => {
                setSelectedRow(header.selectedFlatRows.map(({ original }) => original.id));
              }, [header.selectedFlatRows]);
              return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
            },
            accessor: 'selection',
            Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
            disableSortBy: true,
            style: { width: '10px' }
          }
        ]
      : [];

  const columns = useMemo(
    () => [
      ...columnCheckbox(),
      {
        Header: <FormattedMessage id="action" />,
        accessor: 'action',
        isNotSorting: true,
        style: { textAlign: 'center', width: 90 },
        Cell: (data) => {
          const { id, registrationNo } = data.row.original;
          return (
            <Stack direction="row" spacing={0.25} justifyContent="center">
              <Tooltip title="Lihat Detail" arrow>
                <IconButton size="small" color="primary" onClick={() => setDetailConfig({ isOpen: true, data: { id } })}>
                  <ReceiptLongIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print Invoice" arrow>
                <IconButton size="small" color="default" onClick={() => onPrintInvoice(id, registrationNo)}>
                  <PrinterOutlined />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      },
      {
        Header: <FormattedMessage id="registration-no" />,
        accessor: 'registrationNo',
        Cell: (data) => (
          <Link
            sx={{ cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            onClick={() => setDetailConfig({ isOpen: true, data: { id: data.row.original.id } })}
          >
            {data.value}
          </Link>
        )
      },
      {
        Header: 'Customer',
        accessor: 'customerName',
        Cell: (data) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" fontWeight={600}>
              {data.value || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              📍 {data.row.original.locationName || '—'}
            </Typography>
          </Stack>
        )
      },
      ...(isAdmin
        ? [
            {
              Header: 'Group',
              accessor: 'customerGroup',
              Cell: (data) =>
                data.value ? (
                  <Chip label={data.value} size="small" color="primary" variant="outlined" />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    —
                  </Typography>
                )
            }
          ]
        : []),
      {
        Header: 'Item',
        accessor: 'totalItem',
        style: { textAlign: 'center' },
        Cell: (data) => <Chip label={`${data.value ?? 0} item`} size="small" color="info" variant="outlined" sx={{ fontWeight: 600 }} />
      },
      {
        Header: 'Promo',
        accessor: 'totalUsePromo',
        style: { textAlign: 'center' },
        Cell: (data) =>
          +data.value > 0 ? (
            <Chip label={`${data.value}×`} size="small" color="secondary" variant="outlined" />
          ) : (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          )
      },
      {
        Header: 'Total',
        accessor: 'totalAmount',
        Cell: (data) => (
          <Typography variant="body2" fontWeight={700} color="success.main" noWrap>
            Rp {formatThousandSeparator(data.value || 0)}
          </Typography>
        )
      },
      {
        Header: <FormattedMessage id="created-at" />,
        accessor: 'createdAt',
        Cell: (data) => (
          <Typography variant="caption" color="text.secondary">
            {data.value || '—'}
          </Typography>
        )
      },
      {
        Header: <FormattedMessage id="created-by" />,
        accessor: 'createdBy',
        Cell: (data) => (
          <Typography variant="caption" fontWeight={500}>
            {data.value || '—'}
          </Typography>
        )
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, user]
  );

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="transaction-pet-shop" />} isBreadcrumb />

      {/* ─── Stats Row ─── */}
      <Grid container spacing={2} mb={2}>
        <Grid item xs={6} sm={4}>
          <StatCard
            icon={<ShoppingCartIcon />}
            label="Total Transaksi"
            value={stats.totalTransaksi}
            color="primary"
            sub="Semua transaksi"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <StatCard icon={<StoreIcon />} label="Total Item (halaman ini)" value={stats.totalItems} color="info" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<LocalOfferIcon />}
            label="Transaksi Pakai Promo"
            value={stats.promoCount}
            color="warning"
            sub="Dari halaman ini"
          />
        </Grid>
      </Grid>

      <MainCard content boxShadow>
        {/* ─── Filter Bar ─── */}
        <Grid container spacing={2} mb={2} alignItems="center">
          {/* Search */}
          <Grid item xs={12} sm={isAdmin ? 4 : 6}>
            <GlobalFilter
              placeHolder={intl.formatMessage({ id: 'search' })}
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              className="fullWidth"
              style={{ height: '41.3px' }}
            />
          </Grid>

          {/* Admin: Location + Customer Group */}
          {isAdmin && (
            <>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  id="filterLocation"
                  multiple
                  limitTags={1}
                  options={filterLocationList}
                  value={selectedFilterLocation}
                  className="fullWidth"
                  isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                  onChange={(_, sel) => {
                    setFilterLocation(sel);
                    setParams((p) => ({ ...p, locationId: sel.map((d) => d.value) }));
                  }}
                  renderInput={(p) => <TextField {...p} label={<FormattedMessage id="filter-location" />} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Autocomplete
                  id="filter-customer-group"
                  multiple
                  limitTags={1}
                  options={filterCustomerGroupList}
                  value={selectedFilterCustomerGroup}
                  className="fullWidth"
                  isOptionEqualToValue={(o, v) => v === '' || o.value === v.value}
                  onChange={(_, sel) => {
                    setFilterCustomerGroup(sel);
                    setParams((p) => ({ ...p, customerGroupId: sel.map((d) => d.value) }));
                  }}
                  renderInput={(p) => <TextField {...p} label={<FormattedMessage id="customer-group" />} />}
                />
              </Grid>
            </>
          )}

          {/* Action Buttons */}
          <Grid item xs={12} sm={isAdmin ? 12 : 6}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FilterListIcon />}
                color={showAdvancedFilter ? 'primary' : 'inherit'}
                onClick={() => setShowAdvancedFilter((v) => !v)}
              >
                Filter Lanjutan
                {hasAdvancedFilter && <Chip label="aktif" size="small" color="primary" sx={{ ml: 0.5, height: 16, fontSize: 10 }} />}
              </Button>
              <Button variant="contained" startIcon={<DownloadIcon />} onClick={onExport} color="success">
                <FormattedMessage id="export" />
              </Button>
              {canAdd && (
                <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setFormConfig({ isOpen: true, id: null })}>
                  <FormattedMessage id="transaction" />
                </Button>
              )}
            </Stack>
          </Grid>

          {/* Collapsible Date Filter */}
          <Grid item xs={12}>
            <Collapse in={showAdvancedFilter}>
              <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" mb={1.5}>
                  <FilterListIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                  Filter Lanjutan
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tgl Mulai (Dari)"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={filterDateFrom}
                      onChange={(e) => setFilterDateFrom(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Tgl Mulai (Sampai)"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={filterDateTo}
                      onChange={(e) => setFilterDateTo(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" size="small" onClick={applyAdvancedFilter} fullWidth>
                        Terapkan
                      </Button>
                      <Button variant="outlined" size="small" onClick={resetAdvancedFilter} fullWidth>
                        Reset
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Grid>
        </Grid>

        {/* ─── Table ─── */}
        <ScrollX>
          <ReactTable
            columns={columns}
            data={list || []}
            colSpanPagination={9}
            totalPagination={totalPagination}
            setPageNumber={params.goToPage}
            setPageRow={params.rowPerPage}
            onGotoPage={goToPage}
            onOrder={orderingChange}
            onPageSize={changeLimit}
          />
        </ScrollX>

        {selectedRow.length > 0 && isAdmin && (
          <Stack direction="row" justifyContent="flex-end" mt={1}>
            <Button
              variant="contained"
              startIcon={<DeleteFilled />}
              color="error"
              onClick={() => setDeleteDialog(true)}
              style={{ width: 160 }}
            >
              Hapus ({selectedRow.length})
            </Button>
          </Stack>
        )}
      </MainCard>

      {/* ─── Detail Modal ─── */}
      {detailConfig.isOpen && (
        <TransactionDetailPetShop
          open={detailConfig.isOpen}
          data={detailConfig.data}
          onClose={(action) => {
            const id = detailConfig.data?.id;
            setDetailConfig({ isOpen: false, data: { id: null } });
            if (action === 'edit') {
              setFormConfig({ isOpen: true, id });
            } else {
              setParams((p) => ({ ...p }));
            }
          }}
        />
      )}

      {/* ─── Add / Edit Form Modal ─── */}
      {formConfig.isOpen && (
        <FormTransactionPetShop
          open={formConfig.isOpen}
          id={formConfig.id}
          onClose={(e) => {
            setFormConfig({ isOpen: false, id: null });
            if (e) setParams((p) => ({ ...p }));
          }}
        />
      )}

      {/* ─── Delete Confirm ─── */}
      <ConfirmationC
        open={deleteDialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={onDelete}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
    </>
  );
};

export default TransactionPetShop;
