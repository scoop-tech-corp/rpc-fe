import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useProductSellDetailStore } from '../product-sell-detail-store';

const TabCategories = () => {
  const productCategoryList = useProductSellDetailStore((state) => state.dataSupport.productCategoryList);
  const categoriesStore = useProductSellDetailStore((state) => state.categories);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (categoriesStore.length) {
      const newCategory = categoriesStore.map((gc) => {
        const findPc = productCategoryList.find((pcl) => +pcl.value === +gc);
        if (findPc) {
          return findPc;
        }
      });
      setCategories(newCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesStore]);

  const onSelectedCategory = (_, val) => {
    let setNewData = val.map((dt) => dt.value);
    setCategories(val);

    useProductSellDetailStore.setState({ categories: setNewData, productSellDetailTouch: true });
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
