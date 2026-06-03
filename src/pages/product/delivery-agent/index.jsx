import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend, getLocationList } from 'service/service-global';
import { GlobalFilter } from 'utils/react-table';
import { ReactTable, IndeterminateCheckbox } from 'components/third-party/ReactTable';
import {
  getDeliveryAgents,
  changeDeliveryAgentStatus,
  deleteDeliveryAgent,
  getDeliveryOrders,
  deleteDeliveryOrder
} from './service';
import { DeleteFilled, EditFilled, PlusOutlined } from '@ant-design/icons';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import ConfirmationC from 'components/ConfirmationC';
import TabPanel from 'components/TabPanelC';
import AgentForm from './agent-form';
import OrderDetail from './order-detail';
import RefreshIcon from '@mui/icons-material/Refresh';

const ORDER_STATUSES = ['draft', 'assigned', 'picked_up', 'on_delivery', 'delivered', 'failed', 'cancelled'];

const STATUS_MAP = {
  draft: { label: 'Draft', color: 'warning' },
  assigned: { label: 'Assigned', color: 'info' },
  picked_up: { label: 'Picked Up', color: 'secondary' },
  on_delivery: { label: 'On Delivery', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  failed: { label: 'Failed', color: 'error' },
  cancelled: { label: 'Cancelled', color: 'default' }
};

let paramAgents = {};
let paramOrders = {};

const DeliveryAgentPage = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const intl = useIntl();

  const [tab, setTab] = useState(0);
  const [locationList, setLocationList] = useState([]);

  // ── Agents state ──
  const [agentsData, setAgentsData] = useState({ data: [], totalPagination: 0 });
  const [agentKeyword, setAgentKeyword] = useState('');
  const [agentFilterLocation, setAgentFilterLocation] = useState([]);
  const [agentFilterActive, setAgentFilterActive] = useState('');
  const [selectedAgentRows, setSelectedAgentRows] = useState([]);
  const [agentFormOpen, setAgentFormOpen] = useState(false);
  const [agentFormData, setAgentFormData] = useState(null);
  const [deleteAgentDialog, setDeleteAgentDialog] = useState(false);

  // ── Orders state ──
  const [ordersData, setOrdersData] = useState({ data: [], totalPagination: 0 });
  const [orderKeyword, setOrderKeyword] = useState('');
  const [orderFilterLocation, setOrderFilterLocation] = useState(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState('');
  const [selectedOrderRows, setSelectedOrderRows] = useState([]);
  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [orderDetailId, setOrderDetailId] = useState(null);
  const [deleteOrderDialog, setDeleteOrderDialog] = useState(false);

  // ── Fetch ──
  const fetchAgents = async () => {
    await getDeliveryAgents(paramAgents)
      .then((resp) => {
        const d = resp.data;
        setAgentsData({
          data: d.data ?? d,
          totalPagination: d.total ?? 0
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const fetchOrders = async () => {
    await getDeliveryOrders(paramOrders)
      .then((resp) => {
        const d = resp.data;
        setOrdersData({
          data: d.data ?? d,
          totalPagination: d.total ?? 0
        });
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const clearAgentParams = () => {
    paramAgents = { rowPerPage: 10, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: [], isActive: '' };
    setAgentKeyword('');
    setAgentFilterLocation([]);
    setAgentFilterActive('');
  };

  const clearOrderParams = () => {
    paramOrders = { rowPerPage: 10, goToPage: 1, orderValue: '', orderColumn: '', keyword: '', locationId: '', status: '' };
    setOrderKeyword('');
    setOrderFilterLocation(null);
    setOrderFilterStatus('');
  };

  useEffect(() => {
    const init = async () => {
      const locs = await getLocationList().catch(() => []);
      setLocationList(locs);
      clearAgentParams();
      clearOrderParams();
      fetchAgents();
      fetchOrders();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Agent columns ──
  const agentColumns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            setSelectedAgentRows(header.selectedFlatRows.map(({ original }) => original.id));
          }, [header.selectedFlatRows]);
          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true,
        style: { width: '10px' }
      },
      { Header: <FormattedMessage id="name" defaultMessage="Name" />, accessor: 'name' },
      { Header: <FormattedMessage id="phone" defaultMessage="Phone" />, accessor: 'phone' },
      {
        Header: <FormattedMessage id="vehicle" defaultMessage="Vehicle" />,
        accessor: 'vehicleType',
        Cell: ({ value, row }) => `${value ?? '-'} ${row.original.vehiclePlate ? `(${row.original.vehiclePlate})` : ''}`
      },
      {
        Header: <FormattedMessage id="location" defaultMessage="Location" />,
        accessor: 'location.locationName'
      },
      {
        Header: 'Status',
        accessor: 'isActive',
        Cell: ({ value }) => (
          <Chip
            size="small"
            variant="light"
            color={value ? 'success' : 'error'}
            label={value ? intl.formatMessage({ id: 'active', defaultMessage: 'Active' }) : intl.formatMessage({ id: 'inactive', defaultMessage: 'Inactive' })}
          />
        )
      },
      {
        Header: <FormattedMessage id="action" defaultMessage="Action" />,
        accessor: 'id',
        isNotSorting: true,
        Cell: ({ row }) => {
          const agent = row.original;
          return (
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={<FormattedMessage id="edit" defaultMessage="Edit" />}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => {
                    setAgentFormData(agent);
                    setAgentFormOpen(true);
                  }}
                >
                  <EditFilled />
                </IconButton>
              </Tooltip>
              <Tooltip title={agent.isActive ? <FormattedMessage id="deactivate" defaultMessage="Deactivate" /> : <FormattedMessage id="activate" defaultMessage="Activate" />}>
                <IconButton
                  size="small"
                  color={agent.isActive ? 'warning' : 'success'}
                  onClick={() => onToggleAgentStatus(agent)}
                >
                  {agent.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleOutlineIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Order columns ──
  const orderColumns = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            setSelectedOrderRows(header.selectedFlatRows.map(({ original }) => original.id));
          }, [header.selectedFlatRows]);
          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true,
        style: { width: '10px' }
      },
      {
        Header: 'DO Number',
        accessor: 'deliveryNumber',
        Cell: ({ value, row }) => (
          <Box
            component="span"
            sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              setOrderDetailId(row.original.id);
              setOrderDetailOpen(true);
            }}
          >
            {value}
          </Box>
        )
      },
      { Header: <FormattedMessage id="customer" defaultMessage="Customer" />, accessor: 'customerName' },
      {
        Header: <FormattedMessage id="agent" defaultMessage="Agent" />,
        accessor: 'agent.name',
        Cell: ({ value }) => value ?? '-'
      },
      {
        Header: <FormattedMessage id="location" defaultMessage="Location" />,
        accessor: 'location.locationName'
      },
      { Header: <FormattedMessage id="delivery-date" defaultMessage="Delivery Date" />, accessor: 'deliveryDate' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          const s = STATUS_MAP[value] ?? { label: value, color: 'default' };
          return <Chip size="small" variant="light" color={s.color} label={s.label} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ── Handlers ──
  const onToggleAgentStatus = async (agent) => {
    await changeDeliveryAgentStatus({ id: agent.id, isActive: !agent.isActive })
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess(resp.data?.message ?? 'Status updated'));
          fetchAgents();
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const onConfirmDeleteAgents = async (value) => {
    if (value) {
      await Promise.all(selectedAgentRows.map((id) => deleteDeliveryAgent(id)))
        .then(() => {
          setDeleteAgentDialog(false);
          dispatch(snackbarSuccess('Delivery agents deleted'));
          clearAgentParams();
          fetchAgents();
        })
        .catch((err) => {
          if (err) {
            setDeleteAgentDialog(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDeleteAgentDialog(false);
    }
  };

  const onConfirmDeleteOrders = async (value) => {
    if (value) {
      await Promise.all(selectedOrderRows.map((id) => deleteDeliveryOrder(id)))
        .then(() => {
          setDeleteOrderDialog(false);
          dispatch(snackbarSuccess('Delivery orders deleted'));
          clearOrderParams();
          fetchOrders();
        })
        .catch((err) => {
          if (err) {
            setDeleteOrderDialog(false);
            dispatch(snackbarError(createMessageBackend(err, true, true)));
          }
        });
    } else {
      setDeleteOrderDialog(false);
    }
  };

  // ── Pagination/sort handlers – Agents ──
  const onAgentOrder = (e) => { paramAgents.orderValue = e.order; paramAgents.orderColumn = e.column; fetchAgents(); };
  const onAgentGotoPage = (e) => { paramAgents.goToPage = e; fetchAgents(); };
  const onAgentPageSize = (e) => { paramAgents.rowPerPage = e; fetchAgents(); };
  const onAgentSearch = (v) => { paramAgents.keyword = v; setAgentKeyword(v); fetchAgents(); };
  const onAgentFilterLocation = (v) => { paramAgents.locationId = v.map((l) => l.value); setAgentFilterLocation(v); fetchAgents(); };
  const onAgentFilterActive = (v) => { paramAgents.isActive = v; setAgentFilterActive(v); fetchAgents(); };

  // ── Pagination/sort handlers – Orders ──
  const onOrderOrder = (e) => { paramOrders.orderValue = e.order; paramOrders.orderColumn = e.column; fetchOrders(); };
  const onOrderGotoPage = (e) => { paramOrders.goToPage = e; fetchOrders(); };
  const onOrderPageSize = (e) => { paramOrders.rowPerPage = e; fetchOrders(); };
  const onOrderSearch = (v) => { paramOrders.keyword = v; setOrderKeyword(v); fetchOrders(); };
  const onOrderFilterLocation = (v) => { paramOrders.locationId = v?.value ?? ''; setOrderFilterLocation(v); fetchOrders(); };
  const onOrderFilterStatus = (v) => { paramOrders.status = v; setOrderFilterStatus(v); fetchOrders(); };

  return (
    <>
      <HeaderPageCustom title={<FormattedMessage id="delivery-agent" defaultMessage="Delivery Agent" />} isBreadcrumb />

      <MainCard content={false}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab
              label={<FormattedMessage id="delivery-agents" defaultMessage="Delivery Agents" />}
              id="delivery-tab-0"
              aria-controls="delivery-tabpanel-0"
            />
            <Tab
              label={<FormattedMessage id="delivery-orders" defaultMessage="Delivery Orders" />}
              id="delivery-tab-1"
              aria-controls="delivery-tabpanel-1"
            />
          </Tabs>
        </Box>

        {/* ── Agents Tab ── */}
        <TabPanel value={tab} index={0} name="delivery">
          <ScrollX>
            <Stack spacing={3}>
              <Stack
                direction={matchDownSM ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                sx={{ p: 3, pb: 0 }}
              >
                <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                  <GlobalFilter
                    placeHolder={intl.formatMessage({ id: 'search', defaultMessage: 'Search' })}
                    globalFilter={agentKeyword}
                    setGlobalFilter={onAgentSearch}
                    style={{ height: '41.3px' }}
                  />
                  <Autocomplete
                    multiple
                    limitTags={1}
                    options={locationList}
                    value={agentFilterLocation}
                    sx={{ width: 220 }}
                    isOptionEqualToValue={(opt, val) => opt.value === val.value}
                    onChange={(_, v) => onAgentFilterLocation(v)}
                    renderInput={(params) => (
                      <TextField {...params} label={<FormattedMessage id="filter-location" defaultMessage="Filter Location" />} />
                    )}
                  />
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel><FormattedMessage id="status" defaultMessage="Status" /></InputLabel>
                    <Select
                      value={agentFilterActive}
                      label={<FormattedMessage id="status" defaultMessage="Status" />}
                      onChange={(e) => onAgentFilterActive(e.target.value)}
                    >
                      <MenuItem value=""><em><FormattedMessage id="all" defaultMessage="All" /></em></MenuItem>
                      <MenuItem value="true"><FormattedMessage id="active" defaultMessage="Active" /></MenuItem>
                      <MenuItem value="false"><FormattedMessage id="inactive" defaultMessage="Inactive" /></MenuItem>
                    </Select>
                  </FormControl>
                  {selectedAgentRows.length > 0 && (
                    <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDeleteAgentDialog(true)}>
                      <FormattedMessage id="delete" defaultMessage="Delete" />
                    </Button>
                  )}
                </Stack>
                <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                  <IconButton size="medium" variant="contained" color="primary" onClick={fetchAgents}>
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    onClick={() => {
                      setAgentFormData(null);
                      setAgentFormOpen(true);
                    }}
                  >
                    <FormattedMessage id="new" defaultMessage="New" />
                  </Button>
                </Stack>
              </Stack>

              <ReactTable
                columns={agentColumns}
                data={agentsData.data}
                totalPagination={agentsData.totalPagination}
                setPageNumber={paramAgents.goToPage}
                setPageRow={paramAgents.rowPerPage}
                colSpanPagination={7}
                onOrder={onAgentOrder}
                onGotoPage={onAgentGotoPage}
                onPageSize={onAgentPageSize}
              />
            </Stack>
          </ScrollX>
        </TabPanel>

        {/* ── Orders Tab ── */}
        <TabPanel value={tab} index={1} name="delivery">
          <ScrollX>
            <Stack spacing={3}>
              <Stack
                direction={matchDownSM ? 'column' : 'row'}
                justifyContent="space-between"
                alignItems="center"
                spacing={1}
                sx={{ p: 3, pb: 0 }}
              >
                <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                  <GlobalFilter
                    placeHolder={intl.formatMessage({ id: 'search', defaultMessage: 'Search' })}
                    globalFilter={orderKeyword}
                    setGlobalFilter={onOrderSearch}
                    style={{ height: '41.3px' }}
                  />
                  <Autocomplete
                    options={locationList}
                    value={orderFilterLocation}
                    sx={{ width: 200 }}
                    isOptionEqualToValue={(opt, val) => opt.value === val.value}
                    onChange={(_, v) => onOrderFilterLocation(v)}
                    renderInput={(params) => (
                      <TextField {...params} label={<FormattedMessage id="filter-location" defaultMessage="Filter Location" />} />
                    )}
                  />
                  <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel><FormattedMessage id="status" defaultMessage="Status" /></InputLabel>
                    <Select
                      value={orderFilterStatus}
                      label={<FormattedMessage id="status" defaultMessage="Status" />}
                      onChange={(e) => onOrderFilterStatus(e.target.value)}
                    >
                      <MenuItem value=""><em><FormattedMessage id="all" defaultMessage="All" /></em></MenuItem>
                      {ORDER_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {STATUS_MAP[s]?.label ?? s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {selectedOrderRows.length > 0 && (
                    <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDeleteOrderDialog(true)}>
                      <FormattedMessage id="delete" defaultMessage="Delete" />
                    </Button>
                  )}
                </Stack>
                <Stack spacing={1} direction={matchDownSM ? 'column' : 'row'} style={{ width: matchDownSM ? '100%' : '' }}>
                  <IconButton size="medium" variant="contained" color="primary" onClick={fetchOrders}>
                    <RefreshIcon />
                  </IconButton>
                  <Button
                    variant="contained"
                    startIcon={<PlusOutlined />}
                    onClick={() => navigate('/product/delivery-agent/order/form')}
                  >
                    <FormattedMessage id="new" defaultMessage="New" />
                  </Button>
                </Stack>
              </Stack>

              <ReactTable
                columns={orderColumns}
                data={ordersData.data}
                totalPagination={ordersData.totalPagination}
                setPageNumber={paramOrders.goToPage}
                setPageRow={paramOrders.rowPerPage}
                colSpanPagination={8}
                onOrder={onOrderOrder}
                onGotoPage={onOrderGotoPage}
                onPageSize={onOrderPageSize}
              />
            </Stack>
          </ScrollX>
        </TabPanel>
      </MainCard>

      {/* Agent Form Modal */}
      {agentFormOpen && (
        <AgentForm
          open={agentFormOpen}
          locationList={locationList}
          data={agentFormData}
          onClose={() => setAgentFormOpen(false)}
          onSuccess={() => {
            setAgentFormOpen(false);
            clearAgentParams();
            fetchAgents();
          }}
        />
      )}

      {/* Order Detail Modal */}
      {orderDetailOpen && (
        <OrderDetail
          open={orderDetailOpen}
          id={orderDetailId}
          onClose={() => setOrderDetailOpen(false)}
          onSuccess={() => {
            clearOrderParams();
            fetchOrders();
          }}
        />
      )}

      {/* Delete Agent Confirmation */}
      {deleteAgentDialog && (
        <ConfirmationC
          open={deleteAgentDialog}
          title={<FormattedMessage id="delete" defaultMessage="Delete" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" defaultMessage="Are you sure you want to delete this data?" />}
          onClose={onConfirmDeleteAgents}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}

      {/* Delete Order Confirmation */}
      {deleteOrderDialog && (
        <ConfirmationC
          open={deleteOrderDialog}
          title={<FormattedMessage id="delete" defaultMessage="Delete" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" defaultMessage="Are you sure you want to delete this data?" />}
          onClose={onConfirmDeleteOrders}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
    </>
  );
};

export default DeliveryAgentPage;
