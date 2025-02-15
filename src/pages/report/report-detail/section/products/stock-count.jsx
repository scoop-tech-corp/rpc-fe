import { ReactTable } from 'components/third-party/ReactTable';
import React, { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function ProductsStockCount({ data, filter, setFilter }) {
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="full-name" />,
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
        Header: <FormattedMessage id="supplier-name" />,
        accessor: 'supplierName'
      },
      {
        Header: <FormattedMessage id="location-name" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="in-stock" />,
        accessor: 'inStock'
      }
    ],
    []
  );
  const dataDummy = [
    {
      fullName: 'John Doe',
      category: 'Category A',
      sku: 'SKU123',
      supplierName: 'Supplier A',
      locationName: 'Location A',
      inStock: 100
    },
    {
      fullName: 'Jane Smith',
      category: 'Category B',
      sku: 'SKU456',
      supplierName: 'Supplier B',
      locationName: 'Location B',
      inStock: 50
    },
    {
      fullName: 'John Doe',
      category: 'Category A',
      sku: 'SKU123',
      supplierName: 'Supplier A',
      locationName: 'Location A',
      inStock: 100
    },
    {
      fullName: 'Jane Smith',
      category: 'Category B',
      sku: 'SKU456',
      supplierName: 'Supplier B',
      locationName: 'Location B',
      inStock: 50
    },
    {
      fullName: 'John Doe',
      category: 'Category A',
      sku: 'SKU123',
      supplierName: 'Supplier A',
      locationName: 'Location A',
      inStock: 100
    },
    {
      fullName: 'Jane Smith',
      category: 'Category B',
      sku: 'SKU456',
      supplierName: 'Supplier B',
      locationName: 'Location B',
      inStock: 50
    },
    {
      fullName: 'John Doe',
      category: 'Category A',
      sku: 'SKU123',
      supplierName: 'Supplier A',
      locationName: 'Location A',
      inStock: 100
    }
    // Add more data as needed
  ];

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={14}
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
