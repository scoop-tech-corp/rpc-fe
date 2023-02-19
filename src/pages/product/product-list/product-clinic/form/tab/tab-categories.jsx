import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useProductClinicFormStore } from '../product-clinic-form-store';

const TabCategories = () => {
  const productCategoryList = useProductClinicFormStore((state) => state.dataSupport.productCategoryList);
  const categoriesStore = useProductClinicFormStore((state) => state.categories);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (categoriesStore.length) {
      const newCategory = [];
      categoriesStore.map((gc) => {
        const getId = typeof gc === 'object' ? +gc.id : +gc;
        const findPc = productCategoryList.find((pcl) => +pcl.value === getId);

        if (findPc) newCategory.push(findPc);
      });
      setCategories(newCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSelectedCategory = (_, val) => {
    let setNewData = val.map((dt) => dt.value);
    setCategories(val);

    useProductClinicFormStore.setState({ categories: setNewData, productClinicFormTouch: true });
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