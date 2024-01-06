import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Chart from 'react-apexcharts';

export default function BookingByStatus({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="sale-status" />,
        accessor: 'totalServices'
      },
      { Header: <FormattedMessage id="bookings" />, accessor: 'createdBy' },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity' },
      { Header: <FormattedMessage id="value-rp" />, accessor: 'value' }
    ],
    []
  );

  useEffect(() => {
    const options = {
      series: [44, 55, 41, 17, 15],
      chart: {
        type: 'donut'
      },
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
  }, []);

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
        data={data || []}
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
