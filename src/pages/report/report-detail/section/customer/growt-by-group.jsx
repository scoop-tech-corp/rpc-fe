import ReactApexChart from 'react-apexcharts';

import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function CustomerGrowthByGroup({ data, setFilter }) {
  const chartsData = data?.charts;
  const tablesData = data?.table;

  const options = {
    chart: { width: 350, type: 'pie' },
    labels: chartsData?.labels || [],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' }
        }
      }
    ]
  };

  const tableColumns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="reporting-group" />,
        accessor: 'reportingGroup'
      },
      { Header: 'Total', accessor: 'total' },
      { Header: <FormattedMessage id="new" />, accessor: 'new' },
      { Header: <FormattedMessage id="inactive" />, accessor: 'inactive' },
      { Header: <FormattedMessage id="deleted" />, accessor: 'deleted' }
    ],
    []
  );

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <ReactApexChart options={options} series={chartsData?.series || []} type="pie" height={350} />
      </div>
      <ReactTable
        columns={tableColumns}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
        data={[
          ...(tablesData?.data || []),
          {
            reportingGroup: <strong>Total</strong>,
            total: <strong>{tablesData?.totalData.total || 0}</strong>,
            new: <strong>{tablesData?.totalData.new || 0}</strong>,
            inactive: <strong>{tablesData?.totalData.inactive || 0}</strong>,
            deleted: <strong>{tablesData?.totalData.deleted || 0}</strong>
          }
        ]}
      />
    </>
  );
}
