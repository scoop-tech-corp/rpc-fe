import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import Chart from 'react-apexcharts';

export default function BookingByCancelationReason({ data }) {
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="reason" />,
        accessor: 'reason'
      },
      { Header: <FormattedMessage id="cancelliations" />, accessor: 'cancelliations' }
    ],
    []
  );

  const dataDummy = [
    { reason: 'Meninggal', cancelliations: 50 },
    { reason: 'Penyakit', cancelliations: 100 },
    { reason: 'Mendadak', cancelliations: 300 },
    { reason: 'Cacingan', cancelliations: 20 }
  ];

  useEffect(() => {
    // Extracting data from dataDummy
    const categories = dataDummy.map((item) => item.reason);
    const seriesData = dataDummy.map((item) => item.cancelliations);

    const options = {
      series: seriesData,
      chart: {
        type: 'donut'
      },
      labels: categories, // Set reasons as labels for better representation
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
            reason: <strong>Total</strong>,
            cancelliations: (
              <strong>
                {dataDummy.reduce((total, item) => {
                  return total + item.cancelliations;
                }, 0)}
              </strong>
            )
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
