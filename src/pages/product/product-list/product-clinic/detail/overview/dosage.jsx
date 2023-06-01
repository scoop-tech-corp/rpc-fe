import { Grid } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { ReactTable } from 'components/third-party/ReactTable';

import PropTypes from 'prop-types';
import MainCard from 'components/MainCard';

const ProductClinicDetailOverviewDosage = (props) => {
  const { data } = props;

  const columns = [
    {
      Header: <FormattedMessage id="from" />,
      accessor: 'fromWeight',
      isNotSorting: true
    },
    {
      Header: <FormattedMessage id="to" />,
      accessor: 'toWeight',
      isNotSorting: true
    },
    {
      Header: <FormattedMessage id="dosage" />,
      accessor: 'dosage',
      isNotSorting: true
    },
    {
      Header: 'Unit',
      accessor: 'unit',
      isNotSorting: true
    }
  ];

  return (
    <MainCard title={<FormattedMessage id="dosage" />}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ReactTable columns={columns} data={data} />
        </Grid>
      </Grid>
    </MainCard>
  );
};

ProductClinicDetailOverviewDosage.propTypes = {
  data: PropTypes.array
};

export default ProductClinicDetailOverviewDosage;
