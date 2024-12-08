import ReactApexChart from 'react-apexcharts';

import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function CustomerTotal({ data }) {
  // Create the chart options using dummyChartData
  const series = [
    {
      name: 'RPC Bandung',
      data: [10, 10, 10, 10, 30, 20]
    },
    {
      name: 'RPC Condet',
      data: [20, 40, 20, 10, 80, 30]
    }
  ];
  const options = {
    chart: {
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      zoom: {
        enabled: false
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
      categories: ['1 May', '2 May', '3 May', '4 May', '5 May', '6 May'],
      title: {
        text: ''
      }
    },
    yaxis: {
      title: {
        text: ''
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      floating: false
    }
  };

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location'
      },
      { Header: 'Total', accessor: 'total' }
    ],
    []
  );

  const tableData = useMemo(
    () => [
      {
        location: 'RPC Condet',
        total: 200
      },
      {
        location: 'RPC Bandung',
        total: 300
      }
    ],
    []
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <ReactApexChart options={options} series={series} type="line" height={350} />
      </div>
      <ReactTable
        columns={tableColumns}
        data={[
          ...tableData,
          {
            location: <strong>Total</strong>,
            total: <strong>500</strong>
          }
        ]}
      />
    </>
  );
}
