import { ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getLocationList } from 'service/service-global';
import { formatThousandSeparator } from 'utils/func';

export default function SalesStaffServiceSales({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const [extData, setExtData] = useState({
    location: []
  });

  const getPrepareDataForProductsTable = async () => {
    const getLoc = await getLocationList();

    setExtData((prevState) => ({ ...prevState, location: getLoc }));
  };

  useEffect(() => {
    getPrepareDataForProductsTable();
  }, []);

  const getLocationColumns = () => {
    return extData.location?.map((locationItem) => ({
      Header: locationItem.label,
      accessor: (row) => {
        const locationQty = row.location[locationItem.label];
        return locationQty ? locationQty : 0;
      }
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="staff" />,
        accessor: 'staff'
      },
      {
        Header: <FormattedMessage id="service" />,
        accessor: 'service'
      },
      {
        Header: <FormattedMessage id="pricing" />,
        accessor: 'pricing'
      },
      ...getLocationColumns(),
      {
        Header: <FormattedMessage id="total-qty" />,
        accessor: 'totalQty'
      },
      {
        Header: <FormattedMessage id="total-duration-hours" />,
        accessor: 'totalDuration'
      },
      {
        Header: <FormattedMessage id="total-sold-value-rp" />,
        accessor: 'totalSoldValue',
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extData.location]
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={columns.length}
        setPageNumber={filter.goToPage}
        onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
        setPageRow={filter.rowPerPage}
        onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event }))}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
      />
    </div>
  );
}
