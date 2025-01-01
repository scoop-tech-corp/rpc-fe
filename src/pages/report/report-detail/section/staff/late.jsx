import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { useMemo } from 'react';

import ReactApexChart from 'react-apexcharts';

export default function StaffLate({ data, setFilter }) {
  const chartsData = data?.charts;
  const tablesData = data?.table;

  const options = {
    chart: {
      type: 'line',
      dropShadow: { enabled: true, color: '#000', top: 18, left: 7, blur: 10, opacity: 0.2 },
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    dataLabels: { enabled: true },
    stroke: { curve: 'smooth' },
    title: { text: '', align: 'left' },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      }
    },
    markers: { size: 1 },
    xaxis: {
      categories: chartsData?.categories || ['1 May', '2 May', '3 May', '4 May', '5 May', '6 May'],
      title: { text: '' }
    },
    yaxis: { title: { text: '' } },
    legend: { position: 'bottom', horizontalAlign: 'center', floating: false }
  };

  const tableColumns = useMemo(
    () => [
      { Header: <FormattedMessage id="name" />, accessor: 'name' },
      { Header: <FormattedMessage id="location" />, accessor: 'location' },
      { Header: <FormattedMessage id="job" />, accessor: 'job' },
      { Header: <FormattedMessage id="day" />, accessor: 'day' },
      { Header: <FormattedMessage id="attendance-time" />, accessor: 'attendanceTime' },
      { Header: <FormattedMessage id="homecoming-time" />, accessor: 'homecomingTime' }
    ],
    []
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <ReactApexChart
          options={options}
          series={
            chartsData?.series || [
              {
                name: 'RPC Condet',
                data: [10, 10, 10, 10, 30, 20]
              },
              {
                name: 'RPC Hakam',
                data: [20, 40, 20, 10, 80, 30]
              }
            ]
          }
          type="line"
          height={350}
        />
      </div>
      <ReactTable
        columns={tableColumns}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
        data={
          tablesData?.data || [
            {
              name: 'Udin',
              location: 'RPC Condet',
              job: 'Dokter',
              day: 'Selasa, 24 Dec 2024',
              attendanceTime: '9:30',
              homecomingTime: '10:15'
            },
            {
              name: 'Susi',
              location: 'RPC Hankam',
              job: 'Kasir',
              day: 'Selasa, 24 Dec 2024',
              attendanceTime: '9:46',
              homecomingTime: '10:00'
            }
          ]
        }
      />
    </>
  );
}
