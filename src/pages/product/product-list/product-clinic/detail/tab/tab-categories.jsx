import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { jsonCentralized } from 'utils/json-centralized';
import ProductClinicDetailContext from '../product-clinic-detail-context';

const TabCategories = () => {
  const { productClinicDetail, setProductClinicDetail } = useContext(ProductClinicDetailContext);
  const [categories, setCategories] = useState([]);
  const productCategoryList = productClinicDetail.dataSupport.productCategoryList;

  useEffect(() => {
    if (productClinicDetail.categories.length) {
      const getCategory = jsonCentralized(productClinicDetail.categories);
      const newCategory = getCategory.map((gc) => {
        const findPc = productCategoryList.find((pcl) => +pcl.value === +gc);
        if (findPc) {
          return findPc;
        }
      });
      setCategories(newCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productClinicDetail.categories]);

  const onSelectedCategory = (e, val) => {
    setCategories(val);

    let setNewData = jsonCentralized(val);
    setNewData = setNewData.map((dt) => dt.value);

    setProductClinicDetail((value) => {
      return { ...value, categories: setNewData };
    });
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
