import { FormattedMessage } from 'react-intl';

import HeaderCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import { Stack, useMediaQuery, Grid } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import ApexColumnChart from './chart/column';
import ApexPieChart from 'components/dashboard/pie';
import TableChart from './chart/table';
import AnalyticEcommerce from 'components/dashboard/card';

const ServiceDataStatic = () => {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <HeaderCustom title={<FormattedMessage id="static-data" />} isBreadcrumb={true} />
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} color="success" extra="8,900" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Total Order" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={6} sx={{ marginBottom: 3 }}>
        <MainCard title="Bookings">
          <ApexColumnChart />
        </MainCard>
      </Grid>
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard title="Recent Tickets" content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <TableChart />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard title="Booking By Category" content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <ApexPieChart />
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MainCard title="Most Popular" content={false}>
            <Stack spacing={3}>
              <Stack sx={{ p: 3 }}>
                <Grid container spacing={0.5}>
                  <Grid item xs={12}>
                    <AnalyticEcommerce title="Total Page Views" count="4,42,236" />
                  </Grid>
                  <Grid item xs={12}>
                    <AnalyticEcommerce title="Total Users" count="78,250" color="success" />
                  </Grid>
                  <Grid item xs={12}>
                    <AnalyticEcommerce title="Total Order" count="18,800" isLoss color="warning" />
                  </Grid>
                </Grid>
              </Stack>
            </Stack>
          </MainCard>
        </Grid>
      </Grid>
    </>
  );
};

export default ServiceDataStatic;
