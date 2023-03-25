import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useProductSellFormStore } from '../product-sell-form-store';

const TabCategories = () => {
  const productCategoryList = useProductSellFormStore((state) => state.dataSupport.productCategoryList);
  const categoriesStore = useProductSellFormStore((state) => state.categories);
  const [categories, setCategories] = useState([]);

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

  const onSelectedCategory = (_, val) => {
    setCategories(val);
    useProductSellFormStore.setState({ categories: val, productSellFormTouch: true });
  };

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
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabCategories;
