import { useMemo, useState } from 'react';
import { Button, Grid, IconButton, InputLabel, TextField, Stack, FormControl, Select, MenuItem } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import useGetList from 'hooks/useGetList';
import { getProductList } from '../../../service';
import { useEffect } from 'react';

const defaultForm = {
  productType: '',
  productList: '',
  quantity: ''
};
const ProductRequired = () => {
  const [form, setForm] = useState(defaultForm);
  const productRequired = useServiceFormStore((state) => state.productRequired);
  const location = useServiceFormStore((state) => state.location);
  const isDetail = useServiceFormStore((state) => state.isDetail);
  const listProduct = useGetList(getProductList, { disabled: true, locationId: '[]', api: '' });
  const [render, setRender] = useState(0);

  const onFieldHandler = (event) => {
    setForm((e) => ({ ...e, [event.target.name]: event.target.value }));
  };

  const onAddedProduct = () => {
    productRequired.push({ id: Date.now(), ...form });
    setForm((e) => ({ ...e, productList: '', quantity: '' }));
  };

  useEffect(() => {
    if (form.productType) {
      listProduct.setParams((e) => ({
        ...e,
        disabled: location.length === 0,
        api: form.productType === 'product-sell' ? 'product/sell/list/location' : 'product/clinic/list/location'
      }));
    }
  }, [form.productType]);

  useEffect(() => {
    if (location?.length) {
      listProduct.setParams((e) => ({
        ...e,
        disabled: !form.productType,
        locationId: '[' + location.map((item) => item.value).join(',') + ']'
      }));
    }
  }, [location]);

  const handleDeleteList = (id) => {
    // console.log(id);
    // console.log(productRequired);
    useServiceFormStore.setState((state) => ({
      productRequired: state.productRequired.filter((item) => item.id !== id)
    }));
    setRender((e) => e + 1);
  };

  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="product-type" />,
        accessor: 'productType',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.productType === 'product-sell') return <FormattedMessage id="product-list" />;
          if (data.row.original.productType === 'product-clinic') return <FormattedMessage id="product-clinic" />;
        }
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'productList',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true
      },
      {
        Header: '',
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate || isDetail) return null;
          return (
            <IconButton size="large" color="error" onClick={() => handleDeleteList(data.row.original.id)}>
              <DeleteOutlined />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  return (
    <MainCard title={<FormattedMessage id="product-required" />}>
      <Grid container spacing={3}>
        {!isDetail && (
          <>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productType">{<FormattedMessage id="product-type" />}</InputLabel>
                <FormControl fullWidth>
                  <Select id="select-type" value={form.productType} name="productType" onChange={onFieldHandler}>
                    <MenuItem value={'product-sell'}>
                      <FormattedMessage id="product-sell" />
                    </MenuItem>
                    <MenuItem value={'product-clinic'}>
                      <FormattedMessage id="product-clinic" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="productList">{<FormattedMessage id="product-list" />}</InputLabel>
                <FormControl fullWidth>
                  <Select id="select-type" value={form.productList} name="productList" onChange={onFieldHandler}>
                    {listProduct?.list?.map((item, index) => (
                      <MenuItem value={item.fullName} key={index}>
                        {item.fullName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="quantity">{<FormattedMessage id="quantity" />}</InputLabel>
                <TextField
                  fullWidth
                  id="quantity"
                  InputProps={{ inputProps: { min: 0 } }}
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={onFieldHandler}
                />
              </Stack>
            </Grid>
          </>
        )}
        <Grid item xs={12} sm={6}>
          <ReactTable
            columns={columns}
            key={productRequired?.map((item) => item.id)?.join(',') + render}
            data={productRequired || []}
            totalPagination={0}
          />
        </Grid>
      </Grid>
      {!isDetail && (
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          style={{ marginTop: 20 }}
          onClick={onAddedProduct}
          disabled={!form.productList || !form.productType || !form.quantity}
        >
          <FormattedMessage id="add" />
        </Button>
      )}
    </MainCard>
  );
};

export default ProductRequired;
