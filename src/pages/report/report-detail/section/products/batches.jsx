import { Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import AnalyticEcommerce from 'components/dashboard/card';
import { ReactTable } from 'components/third-party/ReactTable';
import ScrollX from 'components/ScrollX';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { formatThousandSeparator } from 'utils/func';

const getExpiryChip = (expiredDate) => {
  if (!expiredDate) return <Chip label="-" size="small" />;
  const today = new Date();
  const exp = new Date(expiredDate);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return <Chip label="Expired" color="error" size="small" variant="light" />;
  if (diffDays <= 30) return <Chip label={`${diffDays}d left`} color="warning" size="small" variant="light" />;
  return <Chip label="Active" color="success" size="small" variant="light" />;
};

export default function ProductsBatches({ data, filter, setFilter }) {
  const intl = useIntl();
  const tablesData = data?.data || [];
  const totalPagination = data?.totalPagination || 0;
  const summary = data?.summary || {};

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
        accessor: 'quantity',
        Cell: ({ value }) => value ?? '-'
      },
      {
        Header: <FormattedMessage id="price-per-item" />,
        accessor: 'costPerItem',
        Cell: ({ value }) => formatThousandSeparator(value ?? 0)
      },
      {
        Header: <FormattedMessage id="total-value" />,
        accessor: 'totalValue',
        Cell: ({ value }) => formatThousandSeparator(value ?? 0)
      },
      {
        Header: <FormattedMessage id="supplier" />,
        accessor: 'supplierName',
        Cell: ({ value }) => value || '-'
      },
      {
        Header: <FormattedMessage id="expired-date" />,
        accessor: 'expiredDate',
        Cell: ({ value, row }) => (
          <Box display="flex" alignItems="center" gap={1}>
            <span>{value && value !== '-' ? value : '-'}</span>
            {getExpiryChip(row.original.expiredDateRaw)}
          </Box>
        )
      },
      {
        Header: <FormattedMessage id="entry-date" />,
        accessor: 'createdAt'
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
          <Grid item xs={6} sm={3}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'total-batches' })} count={String(summary.total ?? 0)} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'active' })} count={String(summary.active ?? 0)} color="success" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnalyticEcommerce
              title={intl.formatMessage({ id: 'expiry-warning' })}
              count={String(summary.expiringSoon ?? 0)}
              color="warning"
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <AnalyticEcommerce title={intl.formatMessage({ id: 'expired' })} count={String(summary.expired ?? 0)} color="error" />
          </Grid>
        </Grid>

        {/* Expiry Status Filter */}
        <Box sx={{ mb: 2, maxWidth: 220 }}>
          <FormControl fullWidth size="small">
            <InputLabel>
              <FormattedMessage id="expiry-status" />
            </InputLabel>
            <Select
              value={filter?.expiryStatus || ''}
              label={<FormattedMessage id="expiry-status" />}
              onChange={(e) => setFilter((f) => ({ ...f, expiryStatus: e.target.value, goToPage: 1 }))}
            >
              <MenuItem value="">
                <FormattedMessage id="all" />
              </MenuItem>
              <MenuItem value="active">
                <FormattedMessage id="active" />
              </MenuItem>
              <MenuItem value="expiring">
                <FormattedMessage id="expiring-soon" />
              </MenuItem>
              <MenuItem value="expired">
                <FormattedMessage id="expired" />
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
          colSpanPagination={9}
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
