import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { getAllState, useProductClinicFormStore } from '../product-clinic-form-store';

const TabCategories = () => {
  const productCategoryList = useProductClinicFormStore((state) => state.dataSupport.productCategoryList);
  const categoriesStore = useProductClinicFormStore((state) => state.categories);
  const isTouchForm = useProductClinicFormStore((state) => state.productClinicFormTouch);
  const intl = useIntl();

  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const onSelectedCategory = (_, val) => {
    setCategories(val);
    useProductClinicFormStore.setState({ categories: val, productClinicFormTouch: true });
    onCheckValidation();
  };

  const onCheckValidation = () => {
    let getCate = getAllState().categories;
    const isValidCate = getCate && getCate.length;

    setError(!isValidCate ? intl.formatMessage({ id: 'category-is-required' }) : '');
  };

  useEffect(() => {
    if (categoriesStore.length && 'id' in categoriesStore[0]) {
      const newCategory = [];
      categoriesStore.map((gc) => {
        const findPc = productCategoryList.find((pcl) => +pcl.value === +gc.id);
        if (findPc) newCategory.push(findPc);
      });
      setCategories(newCategory);
    } else {
      setCategories(categoriesStore);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTouchForm) {
      onCheckValidation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTouchForm, intl]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="search" />
          </InputLabel>
          <Autocomplete
            id="category"
            multiple
            limitTags={3}
            options={productCategoryList}
            value={categories}
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

export default TabCategories;
