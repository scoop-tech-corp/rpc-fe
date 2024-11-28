import { Grid } from '@mui/material';
import AnalyticEcommerce from 'components/dashboard/card';
import ApexPieChart from 'components/dashboard/pie';
import MainCard from 'components/MainCard';

const DashboardOverview = () => {
  return (
    <>
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Bookings" count="4,42,236" percentage={59.3} extra="35,000" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Total sales value (Rp)" count="78,250" percentage={70.5} color="success" extra="8,900" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="New Customers" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <MainCard title="Booking By Category" content={false}>
            <ApexPieChart />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <MainCard title="Sales by reporting group (Rp)" content={false}>
            <ApexPieChart />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Rebook Rate" count="4,42,236" percentage={59.3} extra="35,000" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Customer Retention" count="78,250" percentage={70.5} color="success" extra="8,900" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce title="Average Sale Value (Rp)" count="18,800" percentage={27.4} isLoss color="warning" extra="1,943" />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardOverview;
