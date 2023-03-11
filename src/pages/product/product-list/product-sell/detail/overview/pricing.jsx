import { Grid, InputLabel } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';
import { formatThousandSeparator } from 'utils/func';

import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';

const ProductSellDetailOverviewPricing = (props) => {
  const { data } = props;

  const renderDetailPricing = (pricingStatus) => {
    if (pricingStatus === 'Basic') return;

    const columns = (pricingStatus) => {
      if (pricingStatus === 'PriceLocations') {
        return [
          {
            Header: <FormattedMessage id="location" />,
            accessor: 'locationName',
            isNotSorting: true
          },
          {
            Header: <FormattedMessage id="price" />,
            accessor: 'price',
            isNotSorting: true,
            Cell: (data) => formatThousandSeparator(data.value)
          }
        ];
      } else if (pricingStatus === 'CustomerGroups') {
        return [
          {
            Header: <FormattedMessage id="customer-group" />,
            accessor: 'customerGroup',
            isNotSorting: true
          },
          {
            Header: <FormattedMessage id="price" />,
            accessor: 'price',
            isNotSorting: true,
            Cell: (data) => formatThousandSeparator(data.value)
          }
        ];
      } else if (pricingStatus === 'Quantities') {
        return [
          {
            Header: <FormattedMessage id="from" />,
            accessor: 'fromQty',
            isNotSorting: true
          },
          {
            Header: <FormattedMessage id="to" />,
            accessor: 'toQty',
            isNotSorting: true
          },
          {
            Header: <FormattedMessage id="price" />,
            accessor: 'price',
            isNotSorting: true,
            Cell: (data) => formatThousandSeparator(data.value)
          }
        ];
      }
    };

    const dataPricingDetail = (detail) => {
      if (detail.pricingStatus === 'PriceLocations') {
        return detail.priceLocations;
      } else if (detail.pricingStatus === 'CustomerGroups') {
        return detail.customerGroups;
      } else if (detail.pricingStatus === 'Quantities') {
        return detail.quantities;
      }
    };

    return (
      <Grid item xs={12}>
        <ReactTable columns={columns(data.pricingStatus)} data={dataPricingDetail(data)} />
      </Grid>
    );
  };

  return (
    <MainCard title={<FormattedMessage id="pricing" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <InputLabel htmlFor="price">{<FormattedMessage id="price" />}</InputLabel>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          {data.price}
        </Grid>
        {renderDetailPricing(data.pricingStatus)}
        <Grid item xs={12} md={6} lg={6}>
          <InputLabel htmlFor="type">{<FormattedMessage id="type" />}</InputLabel>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          {data.pricingStatus}
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProductSellDetailOverviewPricing.propTypes = {
  data: PropTypes.object
};

export default ProductSellDetailOverviewPricing;
