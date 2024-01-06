import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import { useNavigate, useSearchParams } from 'react-router-dom';

const list = {
  bookings: [
    {
      id: 1,
      val: 'By location',
      url: 'by-location'
    },
    {
      id: 2,
      val: 'By status',
      url: 'by-status'
    },
    {
      id: 3,
      val: 'By cancellation reason',
      url: 'by-cancellation-reason'
    },
    {
      id: 4,
      val: 'List',
      url: 'list'
    },
    {
      id: 6,
      val: 'Diagnosis list',
      url: 'diagnosis-list'
    },
    {
      id: 7,
      val: 'By diagnosis, species & gender',
      url: 'by-diagnosis-species-gender'
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

const tab = ['all-reports', 'bookings', 'customer', 'deposit', 'expenses', 'products', 'sales', 'service', 'staff'];

const ReportPage = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  let type = Number(searchParams.get('type')) || 0;

  const onChangeTab = (_, value) => {
    setSearchParams({ type: value });
  };

  const GenerateTab = ({ list, index, title }) => (
    <Box sx={{ mt: 2.5 }}>
      <TabPanel value={type} index={index}>
        <MainCard contentSX={{ padding: 0 }} title={<FormattedMessage id={title} />}>
          <List width="100%" sx={{ padding: 0 }}>
            {list?.map((item) => (
              <ListItem key={item.id} component="div" disablePadding divider>
                <ListItemButton>
                  <ListItemText
                    primary={item.val}
                    onClick={() => {
                      navigate(`/report-detail?type=${title}&detail=${item.url}`, { replace: true });
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
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
              <Tab key={e} label={<FormattedMessage id={e} />} id="service-list-tab-0" aria-controls="service-list-tabpanel-0" />
            ))}
          </Tabs>
        </Box>
        {/* FOR ALL */}
        <GenerateTab list={list.bookings} index={0} title="booking" />
        <GenerateTab list={list.customers} index={0} title="customer" />
        <GenerateTab list={list.deposit} index={0} title="deposit" />
        <GenerateTab list={list.expenses} index={0} title="expenses" />
        <GenerateTab list={list.products} index={0} title="products" />
        <GenerateTab list={list.sales} index={0} title="sales" />
        <GenerateTab list={list.service} index={0} title="service" />
        <GenerateTab list={list.staff} index={0} title="staff" />
        {/* FOR ALL */}

        <GenerateTab list={list.bookings} index={1} title="booking" />
        <GenerateTab list={list.customers} index={2} title="customer" />
        <GenerateTab list={list.deposit} index={3} title="deposit" />
        <GenerateTab list={list.expenses} index={4} title="expenses" />
        <GenerateTab list={list.products} index={5} title="products" />
        <GenerateTab list={list.sales} index={6} title="sales" />
        <GenerateTab list={list.service} index={7} title="service" />
        <GenerateTab list={list.staff} index={8} title="staff" />
      </MainCard>
    </>
  );
};

export default ReportPage;
