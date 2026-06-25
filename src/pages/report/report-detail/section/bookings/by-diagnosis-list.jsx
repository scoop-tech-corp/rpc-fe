import { ReactTable } from 'components/third-party/ReactTable';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import ScrollX from 'components/ScrollX';

const STATUS_COLOR = {
  Selesai: 'success',
  'Dalam Perawatan': 'primary',
  'Menunggu Dokter': 'warning',
  'Cek Kondisi Pet': 'info',
  'Proses Pembayaran': 'secondary',
  Batal: 'error'
};

// Render teks multi-item (comma-separated) sebagai bullet list
const BulletList = ({ value }) => {
  if (!value) return <span>-</span>;
  const items = value.split(', ').filter(Boolean);
  if (items.length === 1) return <span>{items[0]}</span>;
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
};

export default function BookingByDiagnosisList({ data, loading, setFilter }) {
  const rows = Array.isArray(data?.data) ? data.data : [];
  const totalPagination = data?.totalPagination || 0;

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="booking-date" defaultMessage="Booking Date" />,
        accessor: 'bookingDate'
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="queue-chief-complaint" />,
        accessor: 'reasonForVisit',
        Cell: ({ value }) => value || '-'
      },
      {
        Header: <FormattedMessage id="service" />,
        accessor: 'services',
        Cell: ({ value }) => <BulletList value={value} />
      },
      {
        Header: <FormattedMessage id="customer" />,
        accessor: 'customerName'
      },
      {
        Header: 'Record No.',
        accessor: 'recordNo',
        Cell: ({ value }) => value || '-'
      },
      {
        Header: <FormattedMessage id="pet" defaultMessage="Patient" />,
        accessor: 'petName'
      },
      {
        Header: 'Patient Id',
        accessor: 'patientId'
      },
      {
        Header: <FormattedMessage id="weight" defaultMessage="Weight" />,
        accessor: 'weight',
        Cell: ({ value }) => (value ? `${value} Kg` : '-')
      },
      {
        Header: <FormattedMessage id="species" defaultMessage="Species" />,
        accessor: 'species'
      },
      {
        Header: <FormattedMessage id="gender" />,
        accessor: 'gender'
      },
      {
        Header: <FormattedMessage id="diagnose" />,
        accessor: 'diagnosis',
        Cell: ({ value }) => <BulletList value={value} />
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: ({ value }) => <Chip label={value || '-'} color={STATUS_COLOR[value] || 'default'} size="small" />
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
          <FormattedMessage id="no-data" defaultMessage="Tidak ada data diagnosis" />
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
        colSpanPagination={13}
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
