import { Autocomplete, Grid, InputLabel, Stack, TextField, TableCell, TableRow } from '@mui/material';
import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import { useProductBundleFormStore } from './bundle-form-store';
import { ReactTable } from 'components/third-party/ReactTable';
import { formatThousandSeparator } from 'utils/func';
import { useParams } from 'react-router';
import MainCard from 'components/MainCard';

const Product = () => {
  let { id } = useParams();
  const selectedProducts = useProductBundleFormStore((state) => state.selectedProducts);
  const productList = useProductBundleFormStore((state) => state.productList);
  const products = useProductBundleFormStore((state) => state.products);
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="item-name" />,
        accessor: 'itemName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="price" />,
        accessor: 'price',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => formatThousandSeparator(data.value)
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => {
          return (
            <TextField
              fullWidth
              id={`quantity-${data.row.index}`}
              name={`quantity-${data.row.index}`}
              value={data.row.original.quantity}
              onChange={(e) => onQtyHandler(e, data.row)}
              type="number"
              inputProps={{ min: 0 }}
            />
          );
        }
      },
      {
        Header: 'Total',
        accessor: 'total',
        isNotSorting: true,
        style: { width: '200px' },
        Cell: (data) => formatThousandSeparator(data.value)
      }
    ],
    []
  );

  const onQtyHandler = (e, dataRow) => {
    useProductBundleFormStore.setState((prevState) => {
      const newProduct = [...prevState.products];
      const findIdx = newProduct.findIndex((p) => p.productId === dataRow.original.productId);
      const getRowPrice = dataRow.original.price;

      if (newProduct[findIdx].id && !newProduct[findIdx].status) {
        newProduct[findIdx].status = 'update';
      }

      newProduct[findIdx].quantity = +e.target.value;
      newProduct[findIdx].total = +e.target.value * getRowPrice;

      return { products: newProduct, bundleFormTouch: true };
    });
  };

  const onSelectedProduct = (newValue, reason, detail) => {
    useProductBundleFormStore.setState((prevState) => {
      const selected = newValue.map((dt) => ({
        productId: dt.id,
        itemName: dt.label,
        price: dt.price,
        quantity: dt.quantity,
        total: dt.total
      }));

      const oldProducts = prevState.products;
      let products = [];

      if (!id) {
        selected.forEach((dt) => {
          const objOld = oldProducts.find((old) => old.productId === dt.productId);
          if (objOld) products.push(objOld);
          else products.push(dt);
        });
      } else {
        if (reason === 'selectOption') {
          products = [...oldProducts];
          products.push({
            id: null,
            status: 'new',
            ...selected[selected.length - 1]
          });
        } else if (reason === 'removeOption') {
          const findIdx = oldProducts.findIndex((p) => p.productId === detail.option.value);
          products = [...oldProducts];
          products[findIdx].status = 'delete';
        } else if (reason === 'clear') {
          products = [...oldProducts];
          products = products.map((p) => ({ ...p, status: 'delete' }));
        }
      }

      return {
        selectedProducts: newValue,
        products,
        bundleFormTouch: true
      };
    });
  };

  const renderProductsData = () => {
    if (!id) return products;
    else {
      return products.filter((p) => p.status !== 'delete');
    }
  };

  const sumQuantity = () => {
    const newProducts = !id ? products : products.filter((p) => p.status !== 'delete');
    return newProducts.length ? newProducts.map((p) => p.quantity).reduce((a, b) => a + b) : '-';
  };

  const sumTotal = () => {
    const newProducts = !id ? products : products.filter((p) => p.status !== 'delete');
    return newProducts.length ? formatThousandSeparator(newProducts.map((p) => p.total).reduce((a, b) => a + b)) : '-';
  };

  return (
    <MainCard title={<FormattedMessage id="product" />}>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Stack spacing={1}>
            <InputLabel>
              <FormattedMessage id="search-product" />
            </InputLabel>
            <Autocomplete
              id="search-product"
              multiple
              limitTags={3}
              options={productList}
              value={selectedProducts}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value, reason, detail) => onSelectedProduct(value, reason, detail)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          <ReactTable
            columns={columns}
            data={renderProductsData()}
            extensionRow={
              <TableRow>
                <TableCell></TableCell>
                <TableCell>
                  <b>Total</b>
                </TableCell>
                <TableCell>{sumQuantity()}</TableCell>
                <TableCell>{sumTotal()}</TableCell>
              </TableRow>
            }
          />
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default Product;
