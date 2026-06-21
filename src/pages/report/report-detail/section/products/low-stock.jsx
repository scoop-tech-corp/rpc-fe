import { ReactTable } from 'components/third-party/ReactTable';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { getLocationList } from 'service/service-global';

export default function ProductsLowStock({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;
  const [extData, setExtData] = useState({ location: [] });

  useEffect(() => {
    getLocationList().then((getLoc) => {
      setExtData({ location: getLoc });
    });
  }, []);

  const getLocationColumns = () => {
    return extData.location?.map((locationItem) => ({
      Header: locationItem.label,
      accessor: (row) => {
        const locationData = row.quantities?.find((q) => q.location === locationItem.label);
        return locationData ? locationData.qty : '-';
      }
    }));
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'fullName'
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category'
      },
      {
        Header: <FormattedMessage id="sku" />,
        accessor: 'sku'
      },
      {
        Header: <FormattedMessage id="supplier" />,
        accessor: 'supplierName'
      },
      ...getLocationColumns()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [extData.location]
  );

  if (!extData.location.length) return null;

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={extData.location.length + 4}
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
