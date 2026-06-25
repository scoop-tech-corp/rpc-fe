import { ReactTable } from 'components/third-party/ReactTable';
import { useCallback, useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, CircularProgress, Typography } from '@mui/material';
import ScrollX from 'components/ScrollX';

export default function BookingByDiagnosisSpeciesGender({ data, loading, filter, setFilter }) {
  const speciesList = useMemo(() => data?.speciesList || [], [data]);
  const tablesData = data?.data?.species || [];
  const totalPagination = data?.totalPagination || 0;

  const getSpeciesColumns = useCallback(() => {
    return speciesList.map((speciesItem) => ({
      Header: speciesItem,
      isNotSorting: true,
      columns: [
        {
          Header: 'Jantan',
          id: `${speciesItem}-jantan`,
          isNotSorting: true,
          accessor: (row) => row[speciesItem]?.jantan ?? 0
        },
        {
          Header: 'Betina',
          id: `${speciesItem}-betina`,
          isNotSorting: true,
          accessor: (row) => row[speciesItem]?.betina ?? 0
        }
      ]
    }));
  }, [speciesList]);

  const columns = useMemo(
    () => [
      {
        Header: '',
        id: 'empty-group',
        isNotSorting: true,
        columns: [
          {
            Header: 'No',
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
            accessor: 'total',
            isNotSorting: true
          }
        ]
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getSpeciesColumns, speciesList]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tablesData.length) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">
          <FormattedMessage id="no-data" defaultMessage="Tidak ada data" />
        </Typography>
      </Box>
    );
  }

  return (
    <ScrollX>
      <ReactTable
        columns={columns}
        data={tablesData}
        totalPagination={totalPagination}
        colSpanPagination={3 + speciesList.length * 2}
        setPageNumber={filter?.goToPage}
        onGotoPage={(event) => setFilter((e) => ({ ...e, goToPage: event }))}
        setPageRow={filter?.rowPerPage}
        onPageSize={(event) => setFilter((e) => ({ ...e, rowPerPage: event, goToPage: 1 }))}
        onOrder={(event) => {
          setFilter((e) => ({ ...e, orderValue: event.order, orderColumn: event.column }));
        }}
      />
    </ScrollX>
  );
}
