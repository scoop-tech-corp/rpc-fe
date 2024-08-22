import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Chart from 'react-apexcharts';
import NumberFormat from 'react-number-format';

export default function BookingByLocation({ data }) {
  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        location: 'RPC SUMATERA UTARA',
        bookings: '100',
        quantity: 10,
        value: 'Rp. 1.500.000'
      },
      {
        location: 'RPC ACEH',
        bookings: '200',
        quantity: 15,
        value: 'Rp. 3.000.000'
      }
    ],
    []
  );

  // Dummy data for the chart
  const dummyChartData = {
    series: [
      {
        name: 'RPC ACEH',
        data: [10, 10, 10, 10, 30, 20, 10]
      },
      {
        name: 'RPC SUMATERA UTARA',
        data: [20, 40, 20, 10, 80, 30, 10]
      }
    ],
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings' },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity' },
      { Header: <FormattedMessage id="value-rp" />, accessor: 'value' }
    ],
    []
  );

  useEffect(() => {
    // Create the chart options using dummyChartData
    const options = {
      series: dummyChartData.series,
      chart: {
        height: 350,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
        toolbar: {
          show: false
        }
      },
      colors: ['#77B6EA', '#545454'],
      dataLabels: {
        enabled: true
      },
      stroke: {
        curve: 'smooth'
      },
      title: {
        text: '',
        align: 'left'
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        }
      },
      markers: {
        size: 1
      },
      xaxis: {
        categories: dummyChartData.categories,
        title: {
          text: 'Month'
        }
      },
      yaxis: {
        title: {
          text: 'Temperature'
        }
        // min: 5,
        // max: 40
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5
      }
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();

    // Cleanup function
    return () => {
      chart.destroy();
    };
  }, []);

  return (
    <div>
      <div id="chart" style={{ marginBottom: 20 }} />

      <ReactTable
        columns={columns}
        data={[
          ...dummyTableData,
          {
            location: <strong>Total</strong>,
            bookings: <strong>300</strong>,
            quantity: <strong>25</strong>,
            value: <strong>Rp. 4.500.000</strong>
          }
        ]}
        // totalPagination={totalPagination}
        // setPageNumber={params.goToPage}
        // setPageRow={params.rowPerPage}
        // onGotoPage={goToPage}
        // onOrder={orderingChange}
        // onPageSize={changeLimit}
      />
    </div>
  );
}
