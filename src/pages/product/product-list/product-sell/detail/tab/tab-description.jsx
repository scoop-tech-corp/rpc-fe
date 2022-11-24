import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import MainCard from 'components/MainCard';
import { useEffect, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import ProductSellDetailContext from '../product-sell-detail-context';

const TabDescription = () => {
  const { productSellDetail, setProductSellDetail } = useContext(ProductSellDetailContext);
  const [overview, setOverview] = useState({ introduction: '', description: '' });

  useEffect(() => {
    setOverview((value) => {
      return {
        ...value,
        introduction: productSellDetail.introduction || '',
        description: productSellDetail.description || ''
      };
    });
  }, [productSellDetail]);

  const onFieldHandler = (event) => {
    setOverview((value) => {
      return { ...value, [event.target.name]: event.target.value };
    });
  };

  const onBlurHandler = (event) => {
    setProductSellDetail((value) => {
      return { ...value, [event.target.name]: event.target.value };
    });
  };

  return (
    <MainCard title={<FormattedMessage id="overview" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="introduction">
              <FormattedMessage id="introduction" />
            </InputLabel>
            <TextField
              fullWidth
              id="introduction"
              name="introduction"
              value={overview.introduction}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
            />
          </Stack>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="description">
              <FormattedMessage id="description" />
            </InputLabel>
            <TextField
              fullWidth
              id="description"
              name="description"
              value={overview.description}
              onChange={onFieldHandler}
              onBlur={onBlurHandler}
            />
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
