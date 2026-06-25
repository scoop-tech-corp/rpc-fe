import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import ScrollX from 'components/ScrollX';

const STATUS_CHIP = {
  Menunggu: { color: 'warning' },
  Diterima: { color: 'success' },
  Ditolak: { color: 'error' },
  Dibatalkan: { color: 'default' }
};

const SERVICE_CHIP = {
  'Pet Clinic': { color: 'primary' },
  'Pet Hotel': { color: 'error' },
  'Pet Salon': { color: 'warning' },
  Breeding: { color: 'success' }
};

export default function BookingByList({ data, loading, setFilter }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const totalPagination = data?.totalPagination || 0;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="date" defaultMessage="Tanggal" />,
        accessor: 'bookingDate'
      },
      {
        Header: <FormattedMessage id="start-time" />,
        accessor: 'bookingTime'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName'
      },
      {
        Header: <FormattedMessage id="pet" defaultMessage="Hewan" />,
        accessor: 'petName'
      },
      {
        Header: <FormattedMessage id="service" />,
        accessor: 'serviceType',
        Cell: ({ value }) => <Chip label={value} color={SERVICE_CHIP[value]?.color || 'default'} size="small" variant="outlined" />
      },
      {
        Header: <FormattedMessage id="doctor" />,
        accessor: 'doctorName',
        Cell: ({ value }) => value?.trim() || '-'
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: ({ value }) => <Chip label={value} color={STATUS_CHIP[value]?.color || 'default'} size="small" />
      }
    ],
    []
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rows.length) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <Typography color="text.secondary">
          <FormattedMessage id="no-data" defaultMessage="Tidak ada data booking" />
        </Typography>
      </Box>
    );
  }

  return (
    <ScrollX>
      <ReactTable
        columns={columns}
        data={rows}
        totalPagination={totalPagination}
        colSpanPagination={8}
        onOrder={(event) => {
          setFilter((f) => ({ ...f, orderValue: event.order, orderColumn: event.column }));
        }}
        onGotoPage={(page) => {
          setFilter((f) => ({ ...f, goToPage: page }));
        }}
        onPageSize={(size) => {
          setFilter((f) => ({ ...f, rowPerPage: size, goToPage: 1 }));
        }}
      />
    </ScrollX>
  );
}
