import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Chart from 'react-apexcharts';

export default function BookingByStatus({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sale-status" />,
        accessor: 'saleStatus'
      },
      { Header: <FormattedMessage id="bookings" />, accessor: 'bookings' },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity' },
      { Header: <FormattedMessage id="value-rp" />, accessor: 'value' }
    ],
    []
  );

  const dataDummy = [
    { saleStatus: 'Pencilled-in', bookings: 200, quantity: 250, value: 'Rp 250.000' },
    { saleStatus: 'Confirmed', bookings: 300, quantity: 350, value: 'Rp 500.000' },
    { saleStatus: 'Started', bookings: 300, quantity: 350, value: 'Rp 1.000.000' }
  ];

  useEffect(() => {
    // Extracting data from dataDummy
    const categories = dataDummy.map((item) => item.saleStatus);
    const seriesData = dataDummy.map((item) => item.bookings);

    const options = {
      series: seriesData,
      chart: {
        type: 'donut'
      },
      labels: categories, // Set categories as labels for better representation
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };

    const chart = new ApexCharts(document.querySelector('#chart'), options);
    chart.render();

    // Cleanup function
    return () => {
      chart.destroy();
    };
  }, []); // Empty dependency array to ensure useEffect runs only once

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div id="chart" style={{ marginBottom: 20, width: 600, height: 600 }} />
      </div>

      <ReactTable
        columns={columns}
        data={[
          ...dataDummy,
          {
            saleStatus: <strong>Total</strong>,
            bookings: (
              <strong>
                {dataDummy.reduce((total, item) => {
                  return total + item.bookings;
                }, 0)}
              </strong>
            ),
            quantity: (
              <strong>
                {dataDummy.reduce((total, item) => {
                  return total + item.quantity;
                }, 0)}
              </strong>
            ),
            value: <strong>Rp. 1.750.000</strong>
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
