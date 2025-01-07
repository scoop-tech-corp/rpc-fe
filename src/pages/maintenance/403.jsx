import { Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import MainCard from 'components/MainCard';

const ForbiddenPage = () => (
  <MainCard title={<FormattedMessage id="forbidden" />}>
    <Typography variant="body2">
      <FormattedMessage id="forbidden-desc" />
    </Typography>
  </MainCard>
);

export default ForbiddenPage;
