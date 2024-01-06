import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useServiceFormStore } from '../service-form-store';

const TabCategory = () => {
  const categoryList = useServiceFormStore((state) => state.dataSupport.categoryList);
  const categoriesStore = useServiceFormStore((state) => state.categories);
  const isDetail = useServiceFormStore((state) => state.isDetail);
  const intl = useIntl();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const onSelectedCategory = (_, val) => {
    setCategories(val);
    useServiceFormStore.setState({ categories: val });
    onCheckValidation();
  };

  const onCheckValidation = () => {
    let getCate = getAllState().categories;
    const isValidCate = getCate && getCate?.length;

    setError(!isValidCate ? intl.formatMessage({ id: 'category-is-required' }) : '');
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="category" />
          </InputLabel>
          <Autocomplete
            id="category"
            multiple
            readOnly={isDetail}
            options={categoryList}
            value={categoriesStore}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={onSelectedCategory}
            renderInput={(params) => (
              <TextField {...params} error={Boolean(error && error.length > 0)} helperText={error} variant="outlined" />
            )}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabCategory;
