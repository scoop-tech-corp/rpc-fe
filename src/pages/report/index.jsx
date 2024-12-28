import { Box, List, ListItem, ListItemButton, ListItemText, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom'; //useLocation
import { LockOutlined } from '@ant-design/icons';
import { list, tab } from './report.collection';

import MainCard from 'components/MainCard';
import TabPanel from 'components/TabPanelC';
import useAuth from 'hooks/useAuth';

const ReportPage = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  let type = searchParams.get('type') || 'all';

  const navigate = useNavigate();
  const { user } = useAuth();
  const [tabSelected, setTabSelected] = useState(tab.find((dt) => dt.id === type).idx);

  const onChangeTab = (_, value) => {
    setTabSelected(tab[value].idx);
    setSearchParams({ type: tab[value].id });
  };

  const renderGenerateTab = () => {
    return (
      <>
        {['all', 'booking'].includes(type) && <GenerateTab list={list.bookings} index={tab[tabSelected].idx} title="booking" />}
        {['all', 'customer'].includes(type) && <GenerateTab list={list.customers} index={tab[tabSelected].idx} title="customer" />}
        {['all', 'deposit'].includes(type) && <GenerateTab list={list.deposit} index={tab[tabSelected].idx} title="deposit" />}
        {['all', 'expenses'].includes(type) && <GenerateTab list={list.expenses} index={tab[tabSelected].idx} title="expenses" />}
        {['all', 'products'].includes(type) && <GenerateTab list={list.products} index={tab[tabSelected].idx} title="products" />}
        {['all', 'sales'].includes(type) && <GenerateTab list={list.sales} index={tab[tabSelected].idx} title="sales" />}
        {['all', 'service'].includes(type) && <GenerateTab list={list.service} index={tab[tabSelected].idx} title="service" />}
        {['all', 'staff'].includes(type) && <GenerateTab list={list.staff} index={tab[tabSelected].idx} title="staff" />}
      </>
    );
  };

  const checkAccess = (item, title) => {
    const tempUrl = `report-detail?type=${title}&detail=${item.url}`;
    const checkIfExist = user?.reportMenu?.items?.find((e) => e.url === tempUrl);

    return checkIfExist;
  };
  const GenerateTab = ({ list, index, title }) => (
    <Box sx={{ mt: 2.5 }}>
      <TabPanel value={tabSelected} index={index}>
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
          <Tabs value={tabSelected} onChange={onChangeTab} variant="scrollable" scrollButtons="auto" aria-label="report detail tab">
            {tab.map((e) => (
              <Tab
                key={e.id}
                label={<FormattedMessage id={e.val} />}
                id={`report-list-tab-${e.idx}`}
                aria-controls={`report-list-tabpanel-${e.idx}`}
              />
            ))}
          </Tabs>
        </Box>

        {renderGenerateTab()}
      </MainCard>
    </>
  );
};

export default ReportPage;
