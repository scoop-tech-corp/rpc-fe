import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { getDashboardOverView } from '../service';
import { useDispatch } from 'react-redux';
import { snackbarError } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import AnalyticEcommerce from 'components/dashboard/card';
import ApexPieChart from 'components/dashboard/pie';
import MainCard from 'components/MainCard';

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const [dashboardOverview, setDashboardOverview] = useState({
    bookings: {},
    totalSaleValue: {},
    newCustomer: {},
    rebookRate: {},
    customerRetention: {},
    avgSaleValue: {},

    chartsBookingCategory: {},
    chartsReportingGroup: {}
  });

  const fetchData = async () => {
    await getDashboardOverView()
      .then((resp) => {
        const {
          bookings,
          totalSaleValue,
          newCustomer,
          rebookRate,
          avgSaleValue,
          customerRetention,
          chartsBookingCategory,
          chartsReportingGroup
        } = resp.data;

        setDashboardOverview((prevState) => ({
          ...prevState,
          bookings,
          totalSaleValue,
          newCustomer,
          rebookRate,
          avgSaleValue,
          customerRetention,
          chartsBookingCategory,
          chartsReportingGroup
        }));
      })
      .catch((err) => {
        if (err) {
          dispatch(snackbarError(createMessageBackend(err)));
        }
      });
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Bookings"
            count={dashboardOverview?.bookings.total}
            isLoss={Boolean(dashboardOverview?.bookings.isLoss)}
            percentage={Number(dashboardOverview?.bookings.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Total sales value (Rp)"
            count={dashboardOverview?.totalSaleValue.total}
            isLoss={Boolean(dashboardOverview?.totalSaleValue.isLoss)}
            color="success"
            percentage={Number(dashboardOverview?.totalSaleValue.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="New Customers"
            count={dashboardOverview?.newCustomer.total}
            isLoss={Boolean(dashboardOverview?.newCustomer.isLoss)}
            color="warning"
            percentage={Number(dashboardOverview?.newCustomer.percentage)}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <MainCard title="Booking By Category" content={false}>
            <ApexPieChart
              labelsProps={dashboardOverview.chartsBookingCategory.labels}
              seriesProps={dashboardOverview.chartsBookingCategory.series}
            />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <MainCard title="Sales by reporting group (Rp)" content={false}>
            <ApexPieChart
              labelsProps={dashboardOverview.chartsReportingGroup.labels}
              seriesProps={dashboardOverview.chartsReportingGroup.series}
            />
          </MainCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Rebook Rate"
            count={dashboardOverview?.rebookRate.total}
            isLoss={Boolean(dashboardOverview?.rebookRate.isLoss)}
            percentage={Number(dashboardOverview?.rebookRate.percentage)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Customer Retention"
            count={dashboardOverview?.customerRetention.total}
            isLoss={Boolean(dashboardOverview?.customerRetention.isLoss)}
            percentage={Number(dashboardOverview?.customerRetention.percentage)}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnalyticEcommerce
            title="Average Sale Value (Rp)"
            count={dashboardOverview?.avgSaleValue.total}
            isLoss={Boolean(dashboardOverview?.avgSaleValue.isLoss)}
            percentage={Number(dashboardOverview?.avgSaleValue.percentage)}
            color="warning"
          />
        </Grid>
      </Grid>
    </>
  );
};

export default DashboardOverview;
