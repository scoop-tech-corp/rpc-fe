import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LineChartOutlined, LockOutlined, PieChartOutlined, UnorderedListOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';

const list = {
  bookings: [
    {
      id: 1,
      val: 'By location',
      url: 'by-location',
      icon: <LineChartOutlined />
    },
    {
      id: 2,
      val: 'By status',
      url: 'by-status',
      icon: <PieChartOutlined />
    },
    {
      id: 3,
      val: 'By cancellation reason',
      url: 'by-cancellation-reason',
      icon: <PieChartOutlined />
    },
    {
      id: 4,
      val: 'List',
      url: 'list',
      icon: <UnorderedListOutlined />
    },
    {
      id: 6,
      val: 'Diagnosis list',
      url: 'diagnosis-list',
      icon: <UnorderedListOutlined />
    },
    {
      id: 7,
      val: 'By diagnosis, species & gender',
      url: 'by-diagnosis-species-gender',
      icon: <UnorderedListOutlined />
    }
  ],
  customers: [
    {
      id: 1,
      val: 'Growth'
    },
    {
      id: 2,
      val: 'Growth by group'
    },
    {
      id: 3,
      val: 'Total'
    },
    {
      id: 4,
      val: 'Leaving'
    },
    {
      id: 5,
      val: 'List'
    },
    {
      id: 6,
      val: 'Credit balance'
    },
    { id: 7, val: 'Customer support' },
    {
      id: 8,
      val: 'Customer letters'
    }
  ],
  deposit: [
    { id: 1, val: 'Summary' },
    { id: 2, val: 'List' }
  ],
  expenses: [
    { id: 1, val: 'Summary' },
    { id: 2, val: 'List' }
  ],
  products: [
    { id: 1, val: 'Stock count' },
    { id: 2, val: 'Low stock' },
    { id: 3, val: 'No stock' },
    { id: 4, val: 'Batches' },
    { id: 5, val: 'Expiry' },
    { id: 6, val: 'Cost' }
  ],
  sales: [
    { id: 1, val: 'Summary' },
    { id: 2, val: 'Value by item type' },
    { id: 3, val: 'Details' },
    { id: 4, val: 'Items' },
    { id: 5, val: 'Discount summary' },
    { id: 6, val: 'Payment summary' },
    { id: 7, val: 'Payment list' },
    { id: 8, val: 'Unpaid' },
    { id: 9, val: 'Sales by service' },
    { id: 10, val: 'Sales by product' },
    { id: 11, val: 'Net income' },
    { id: 12, val: 'Package summary' },
    { id: 13, val: 'Customer spend' },
    { id: 14, val: 'Daily reconciliation' },
    { id: 15, val: 'Daily audit' },
    { id: 16, val: 'Refunds' }
  ],
  staff: [
    { id: 1, val: 'Staff utilization' },
    { id: 2, val: 'Staff peformance' },
    { id: 3, val: 'Staff logins' }
  ],
  service: [{ id: 1, val: 'Summary ' }]
};

const tab = [
  {
    id: 'all',
    val: 'all-reports'
  },
  {
    id: 'booking',
    val: 'booking'
  },
  {
    id: 'customer',
    val: 'customer'
  },
  {
    id: 'deposit',
    val: 'deposit'
  },
  {
    id: 'expenses',
    val: 'expenses'
  },
  {
    id: 'products',
    val: 'products'
  },
  {
    id: 'sales',
    val: 'sales'
  },
  {
    id: 'service',
    val: 'service'
  },
  {
    id: 'staff',
    val: 'staff'
  }
];

const ReportPage = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user } = useAuth();

  let type = searchParams.get('type') || 'all';
  const location = useLocation();
  console.log(location, 99999999);
  const onChangeTab = (_, value) => {
    setSearchParams({ type: tab[value].id });
  };

  const checkAccess = (item, title) => {
    const tempUrl = `report-detail?type=${title}&detail=${item.url}`;
    const checkIfExist = user.reportMenu.find((e) => e.url === tempUrl);

    return checkIfExist;
  };
  const GenerateTab = ({ list, index, title }) => (
    <Box sx={{ mt: 2.5 }}>
      <TabPanel value={type} index={index}>
        <MainCard contentSX={{ padding: 0 }} title={<FormattedMessage id={title} />}>
          <List width="100%" sx={{ padding: 0 }}>
            {list?.map((item) => {
              const thisAccess = checkAccess(item, title);
              return (
                <ListItem key={item.id} component="div" disablePadding divider>
                  <ListItemButton
                    style={{
                      display: 'flex',
                      gap: 10
                    }}
                  >
                    {thisAccess ? item.icon : <LockOutlined />}
                    <ListItemText
                      primary={item.val}
                      onClick={() => {
                        if (!thisAccess) return;
                        navigate(`/report-detail?type=${title}&detail=${item.url}`, { replace: true });
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </MainCard>
      </TabPanel>
    </Box>
  );

  return (
    <>
      <MainCard border={false} boxShadow>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs value={type} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="product sell detail tab">
            {tab.map((e) => (
              <Tab key={e.id} label={<FormattedMessage id={e.val} />} id="service-list-tab-0" aria-controls="service-list-tabpanel-0" />
            ))}
          </Tabs>
        </Box>
        {/* FOR ALL */}
        <GenerateTab list={list.bookings} index={'all'} title="booking" />
        <GenerateTab list={list.customers} index={'all'} title="customer" />
        <GenerateTab list={list.deposit} index={'all'} title="deposit" />
        <GenerateTab list={list.expenses} index={'all'} title="expenses" />
        <GenerateTab list={list.products} index={'all'} title="products" />
        <GenerateTab list={list.sales} index={'all'} title="sales" />
        <GenerateTab list={list.service} index={'all'} title="service" />
        <GenerateTab list={list.staff} index={'all'} title="staff" />
        {/* FOR ALL */}

        <GenerateTab list={list.bookings} index={'booking'} title="booking" />
        <GenerateTab list={list.customers} index={'customer'} title="customer" />
        <GenerateTab list={list.deposit} index={'deposit'} title="deposit" />
        <GenerateTab list={list.expenses} index={'expenses'} title="expenses" />
        <GenerateTab list={list.products} index={'products'} title="products" />
        <GenerateTab list={list.sales} index={'sales'} title="sales" />
        <GenerateTab list={list.service} index={'service'} title="service" />
        <GenerateTab list={list.staff} index={'staff'} title="staff" />
      </MainCard>
    </>
  );
};

export default ReportPage;
