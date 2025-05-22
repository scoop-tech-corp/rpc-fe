import { ReactTable } from 'components/third-party/ReactTable';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';

export default function BookingByDiagnosisSpeciesGender({ data, filter, setFilter }) {
  const tablesData = data?.data.species || [];
  const totalPagination = data?.totalPagination;

  const extData = useMemo(
    () => ({
      speciesList: data?.speciesList || []
    }),
    [data]
  );

  // Dummy data for the table
  const dummyTableData = useMemo(
    () => [
      {
        no: '1',
        diagnosis: 'Diagnosis 1',
        total: 60,
        anjing: {
          betina: 10,
          jantan: 10
        },
        ayam: {
          betina: 10,
          jantan: 10
        },
        burung: {
          betina: 10,
          jantan: 10
        }
      },
      {
        no: '2',
        diagnosis: 'Diagnosis 2',
        total: 60,
        anjing: {
          betina: 10,
          jantan: 10
        },
        ayam: {
          betina: 10,
          jantan: 10
        },
        burung: {
          betina: 10,
          jantan: 10
        }
      }
    ],
    []
  );

  const getSpeciesColumns = useCallback(() => {
    return extData.speciesList?.map((speciesItem) => ({
      Header: speciesItem,
      isNotSorting: true,
      columns: [
        {
          Header: 'Jantan',
          id: `${speciesItem}-jantan`,
          isNotSorting: true,
          accessor: (row) => {
            return row[speciesItem].jantan;
          }
        },
        {
          Header: 'Betina',
          id: `${speciesItem}-betina`,
          isNotSorting: true,
          accessor: (row) => {
            return row[speciesItem].betina;
          }
        }
      ]
    }));
  }, [extData]);

  const columns = useMemo(
    () => [
      {
        Header: '',
        id: 'empty-group',
        isNotSorting: true,
        columns: [
          {
            Header: 'no',
            accessor: 'no',
            isNotSorting: true
          },
          {
            Header: <FormattedMessage id="diagnose" />,
            accessor: 'diagnosis'
          }
        ]
      },
      ...getSpeciesColumns(),
      {
        Header: '',
        id: 'empty-group-2',
        isNotSorting: true,
        columns: [
          {
            Header: <FormattedMessage id="total" />,
            accessor: 'total'
          }
        ]
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getSpeciesColumns, extData]
  );

  return (
    <div>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination || 0}
        colSpanPagination={3 + (extData.speciesList?.length || 0) * 2}
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
