import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import AnalyticEcommerce from 'components/dashboard/card';
import { ReactTable } from 'components/third-party/ReactTable';
import ScrollX from 'components/ScrollX';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const statusColors = {
  Expired: 'error',
  Kritis: 'warning',
  Peringatan: 'default',
  Aman: 'success'
};

const StatusChip = ({ status, label }) => (
  <Chip label={label || status} color={statusColors[status] || 'default'} size="small" variant="light" />
);

export default function ProductExpiry({ data, filter, setFilter }) {
  const intl = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination || 0;
  const summary = data?.summary || {};

  const statusLabel = (status) => {
    const map = {
      Expired: intl.formatMessage({ id: 'expired' }),
      Kritis: intl.formatMessage({ id: 'critical' }),
      Peringatan: intl.formatMessage({ id: 'warning-expiry' }),
      Aman: intl.formatMessage({ id: 'safe' })
    };
    return map[status] || status;
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="batch-number" />,
        accessor: 'batchNumber'
      },
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productName'
      },
      {
        Header: <FormattedMessage id="sku" />,
        accessor: 'sku'
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity'
      },
      {
        Header: <FormattedMessage id="expired-date" />,
        accessor: 'expiredDate'
      },
      {
        Header: <FormattedMessage id="days-left" />,
        accessor: 'daysLeft',
        Cell: ({ value }) => {
          if (value < 0)
            return (
              <span style={{ color: '#d32f2f' }}>
                {value} {intl.formatMessage({ id: 'day' })}
              </span>
            );
          if (value <= 7)
            return (
              <span style={{ color: '#e65100' }}>
                {value} {intl.formatMessage({ id: 'day' })}
              </span>
            );
          if (value <= 30)
            return (
              <span style={{ color: '#f57f17' }}>
                {value} {intl.formatMessage({ id: 'day' })}
              </span>
            );
          return (
            <span style={{ color: '#2e7d32' }}>
              {value} {intl.formatMessage({ id: 'day' })}
            </span>
          );
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'locationName'
      },
      {
        Header: <FormattedMessage id="status" />,
        accessor: 'status',
        Cell: ({ value }) => <StatusChip status={value} label={statusLabel(value)} />
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl.locale]
  );

  return (
    <Box>
      {/* Summary Cards */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={2.4}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'total' })} count={String(summary.total ?? 0)} />
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'expired' })} count={String(summary.expired ?? 0)} color="error" />
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <AnalyticEcommerce
              title={intl.formatMessage({ id: 'expiry-critical' })}
              count={String(summary.critical ?? 0)}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'expiry-warning' })} count={String(summary.warning ?? 0)} color="warning" />
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'expiry-safe' })} count={String(summary.safe ?? 0)} color="success" />
          </Grid>
        </Grid>

        {/* Status Filter */}
        <Box sx={{ mb: 2, maxWidth: 220 }}>
          <FormControl fullWidth size="small">
            <InputLabel>
              <FormattedMessage id="status" />
            </InputLabel>
            <Select
              value={filter?.status || ''}
              label={<FormattedMessage id="status" />}
              onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value, goToPage: 1 }))}
            >
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              <MenuItem value="expired">
                <FormattedMessage id="expired" />
              </MenuItem>
              <MenuItem value="critical">
                <FormattedMessage id="expiry-critical" />
              </MenuItem>
              <MenuItem value="warning">
                <FormattedMessage id="expiry-warning" />
              </MenuItem>
              <MenuItem value="upcoming90">
                <FormattedMessage id="expiry-upcoming-90" />
              </MenuItem>
              <MenuItem value="safe">
                <FormattedMessage id="expiry-safe" />
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <ScrollX>
        <ReactTable
          columns={columns}
          data={tablesData}
          totalPagination={totalPagination}
          colSpanPagination={8}
          setPageNumber={filter?.goToPage}
          onGotoPage={(page) => setFilter((f) => ({ ...f, goToPage: page }))}
          setPageRow={filter?.rowPerPage}
          onPageSize={(size) => setFilter((f) => ({ ...f, rowPerPage: size, goToPage: 1 }))}
          onOrder={(event) => setFilter((f) => ({ ...f, orderValue: event.order, orderColumn: event.column }))}
        />
      </ScrollX>
    </Box>
  );
}
