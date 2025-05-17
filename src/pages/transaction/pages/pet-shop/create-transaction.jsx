import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Autocomplete, Box, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import ErrorContainer from 'components/@extended/ErrorContainer';
import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import IconButton from 'components/@extended/IconButton';
import { loaderGlobalConfig, loaderService } from 'components/LoaderGlobal';
import MainCard from 'components/MainCard';
import ModalC from 'components/ModalC';
import { ReactTable } from 'components/third-party/ReactTable';
import { getProductClinicDropdown, getProductSellDropdown } from 'pages/product/product-list/service';
import {
  createPetShopTransaction,
  getLocationTransactionList,
  getPaymentMethodTransactionList,
  getPromoList,
  submitPromoDiscount
} from 'pages/transaction/service';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { createMessageBackend, getCustomerByLocationList } from 'service/service-global';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { formatThousandSeparator, jsonCentralized } from 'utils/func';
import { create } from 'zustand';
import FormPaymentMethod from './form/FormPaymentMethod';

const CONSTANT_FORM_VALUE = {
  customer: '',
  location: null,
  customerId: '',
  customerName: null,
  productSellSelected: null,
  productSellStock: 0,
  productSellMinPrice: 0,
  productSellPrice: null,
  productSellQuantity: null,
  productClinicSelected: null,
  productClinicStock: 0,
  productClinicMinPrice: 0,
  productClinicPrice: null,
  productClinicQuantity: null,
  notes: '',
  paymentMethodSelected: null
};

const INITIAL_STATE_PROMO = {
  freeItems: [],
  discounts: [],
  bundles: [],
  basedSales: []
};

export const dropdownList = create(() =>
  jsonCentralized({
    locationList: [],
    customerList: [],
    productSellList: [],
    productClinicList: [],
    paymentMethodList: [],
    // promo
    promoFreeItem: [],
    promoDiscount: [],
    promoBundles: [],
    promoBasedSales: []
  })
);
export const getDropdownAll = () => dropdownList.getState();

export default function CreateTransactionPetShop() {
  const [formValue, setFormValue] = useState(CONSTANT_FORM_VALUE);
  const customerList = dropdownList((state) => state.customerList);
  const [errContent, setErrContent] = useState({ title: '', detail: '' });
  const [isError, setIsError] = useState(false);
  const [formErrors, setFormErrors] = useState({
    productSellSelectedError: '',
    productSellMinPriceError: '',
    productSellQuantityError: '',
    productClinicSelectedError: '',
    productClinicMinPriceError: '',
    productClinicQuantityError: ''
  });
  const [newTransactionData, setNewTransactionData] = useState([]);
  const [newTransactionSummaryData, setNewTransactionSummaryData] = useState(null);

  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoData, setPromoData] = useState(INITIAL_STATE_PROMO);
  const [selectedPromoData, setSelectedPromoData] = useState(INITIAL_STATE_PROMO);

  const [openFormPaymentMethod, setOpenFormPaymentMethod] = useState(false);
  const [disabledOk, setDisabledOk] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onAddPaymentMethod = () => setOpenFormPaymentMethod(true);
  const onCloseFormPaymentMethod = async (val) => {
    if (val) {
      setOpenFormPaymentMethod(false);
      const getPaymentMethod = await getPaymentMethodTransactionList();
      dropdownList.setState((prevState) => {
        return {
          ...prevState,
          paymentMethodList: getPaymentMethod
        };
      });
    }
  };

  const onFieldHandler = (event) => {
    setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  };

  const getCustomerByLocation = async (locationId) => {
    const getCustomer = await getCustomerByLocationList(locationId);
    dropdownList.setState((prevState) => ({ ...prevState, customerList: getCustomer }));
  };

  const getDropdownList = () => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const getLocation = await getLocationTransactionList();
      const getPaymentMethod = await getPaymentMethodTransactionList();

      dropdownList.setState((prevState) => ({
        ...prevState,
        locationList: getLocation,
        paymentMethodList: getPaymentMethod
      }));

      resolve(true);
    });
  };

  useEffect(() => {
    if (!formValue.location) return;

    setNewTransactionData([]);
    setNewTransactionSummaryData(null);

    const getProductDropdown = async () => {
      const getProductSell = await getProductSellDropdown(formValue.location.value);
      const getProductClinic = await getProductClinicDropdown(formValue.location.value);

      dropdownList.setState((prevState) => ({
        ...prevState,
        productSellList: getProductSell.map((product) => ({
          ...product,
          label: `${product.data.fullName} - ${formatThousandSeparator(product.data.price)}`
        })),
        productClinicList: getProductClinic.map((product) => ({
          ...product,
          label: `${product.data.fullName} - ${formatThousandSeparator(product.data.price)}`
        }))
      }));
    };

    getProductDropdown();
  }, [formValue.location]);

  const getData = async () => {
    loaderGlobalConfig.setLoader(true);

    await getDropdownList();

    loaderGlobalConfig.setLoader(false);
    loaderService.setManualLoader(false);
  };

  useEffect(() => {
    getData();

    return () => {
      dropdownList.setState(jsonCentralized({ locationList: [], customerList: [], productSellList: [], productClinicList: [] }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProductSellToTransactionList = () => {
    const isSellPriceLowerThanMinPrice = Number(formValue.productSellPrice) < formValue.productSellMinPrice;
    const isSellQuantityExceedStock = Number(formValue.productSellQuantity) > formValue.productSellStock;
    const isSellProductAlreadyAdded = newTransactionData.some((item) => item.productId === formValue.productSellSelected.value);

    if (isSellPriceLowerThanMinPrice || isSellQuantityExceedStock || isSellProductAlreadyAdded) {
      setIsError(true);

      if (isSellProductAlreadyAdded) {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellSelectedError: 'Product already added.'
        }));

        return;
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellSelectedError: ''
        }));
      }

      if (isSellPriceLowerThanMinPrice) {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellMinPriceError: `Price must be greater than or equal to the base price. Minimum price: ${formatThousandSeparator(
            formValue.productSellMinPrice
          )}`
        }));
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellMinPriceError: ''
        }));
      }

      if (isSellQuantityExceedStock) {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellQuantityError: `Quantity exceeds stock. Only ${formValue.productSellStock} left in stock.`
        }));
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productSellQuantityError: ''
        }));
      }

      return;
    }

    setNewTransactionData((prevState) => [
      ...prevState,
      {
        locationId: formValue.location.value,
        productId: formValue.productSellSelected.value,
        productName: formValue.productSellSelected.label,
        category: 'productSell',
        quantity: +formValue.productSellQuantity,
        unitPrice: +formValue.productSellPrice,
        totalPrice: +formValue.productSellPrice * +formValue.productSellQuantity
      }
    ]);

    // reset form
    setFormValue((prevState) => ({
      ...prevState,
      productSellSelected: null,
      productSellStock: 0,
      productSellMinPrice: 0,
      productSellPrice: null,
      productSellQuantity: null
    }));

    // reset error
    setFormErrors((prevState) => ({
      ...prevState,
      productSellSelectedError: '',
      productSellMinPriceError: '',
      productSellQuantityError: ''
    }));
    setIsError(false);
  };

  const addProductClinicToTransactionList = () => {
    const isClinicPriceLowerThanMinPrice = formValue.productClinicPrice < formValue.productClinicMinPrice;
    const isClinicQuantityExceedStock = Number(formValue.productClinicQuantity) > formValue.productClinicStock;
    const isClinicProductAlreadyAdded = newTransactionData.some((item) => item.productId === formValue.productClinicSelected.value);

    if (isClinicPriceLowerThanMinPrice || isClinicQuantityExceedStock || isClinicProductAlreadyAdded) {
      setIsError(true);

      if (isClinicProductAlreadyAdded) {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicSelectedError: 'Product already added.'
        }));

        return;
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicSelectedError: ''
        }));
      }

      if (isClinicPriceLowerThanMinPrice) {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicMinPriceError: `Price must be greater than or equal to the base price. Minimum price: ${formatThousandSeparator(
            formValue.productClinicMinPrice
          )}`
        }));
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicMinPriceError: ''
        }));
      }

      if (isClinicQuantityExceedStock) {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicQuantityError: `Quantity exceeds stock. Only ${formValue.productClinicStock} left in stock.`
        }));
      } else {
        setFormErrors((prevState) => ({
          ...prevState,
          productClinicQuantityError: ''
        }));
      }

      return;
    }

    setNewTransactionData((prevState) => [
      ...prevState,
      {
        locationId: formValue.location.value,
        productId: formValue.productClinicSelected.value,
        productName: formValue.productClinicSelected.label,
        category: 'productClinic',
        quantity: +formValue.productClinicQuantity,
        unitPrice: +formValue.productClinicPrice,
        totalPrice: +formValue.productClinicPrice * +formValue.productClinicQuantity
      }
    ]);

    // reset form
    setFormValue((prevState) => ({
      ...prevState,
      productClinicSelected: null,
      productClinicStock: 0,
      productClinicMinPrice: 0,
      productClinicPrice: null,
      productClinicQuantity: null
    }));

    // reset error
    setFormErrors((prevState) => ({
      ...prevState,
      productClinicSelectedError: '',
      productClinicMinPriceError: '',
      productClinicQuantityError: ''
    }));
    setIsError(false);
  };

  useEffect(() => {
    if (isPromoOpen) {
      const getPromoRequestBody = newTransactionData.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        eachPrice: item.unitPrice,
        priceOverall: item.totalPrice,
        locationId: item.locationId
      }));

      const getPromoData = async () => {
        const promoList = await getPromoList({
          customerId: formValue?.customerName?.value || null,
          transactions: JSON.stringify(getPromoRequestBody)
        });

        const promo = promoList.data;

        setPromoData({
          freeItems: promo.freeItem,
          discounts: promo.discount,
          bundles: promo.bundles,
          basedSales: promo.basedSales
        });
      };

      getPromoData();
    }
  }, [isPromoOpen]);

  const columns = useMemo(
    () => [
      {
        Header: 'No.',
        accessor: (_, index) => index + 1, // nomor urut dimulai dari 1
        id: 'rowNumber',
        isNotSorting: true,
        Cell: ({ row }) => row.index + 1
      },
      { Header: <FormattedMessage id="product-name" />, accessor: 'productName', isNotSorting: true },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="unit-price" />, accessor: 'unitPrice', isNotSorting: true },
      { Header: <FormattedMessage id="total-price" />, accessor: 'totalPrice', isNotSorting: true },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (data) => {
          const onDeleteTransactionList = () => {
            setNewTransactionData((prevState) => prevState.filter((item) => item.productId !== data.row.original.productId));
          };

          return (
            <IconButton size="large" color="error" onClick={() => onDeleteTransactionList()}>
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const summaryColumns = useMemo(
    () => [
      {
        Header: 'No.',
        accessor: (_, index) => index + 1, // nomor urut dimulai dari 1
        id: 'rowNumber',
        isNotSorting: true,
        Cell: ({ row }) => row.index + 1
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'item_name',
        Cell: (data) => {
          const bundleIncludedItems = data.row.original?.included_items || [];

          return (
            <div>
              <p>{data.value}</p>
              {bundleIncludedItems.length > 0 && (
                <>
                  {bundleIncludedItems.map((item, index) => (
                    <p key={item.name + index}>
                      {item.name} (harga normal Rp {formatThousandSeparator(item.normal_price)})
                    </p>
                  ))}
                </>
              )}
            </div>
          );
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true,
        Cell: (data) => (data.value === 'productSell' ? 'Product Sell' : 'Product Clinic')
      },
      { Header: <FormattedMessage id="quantity" />, accessor: 'quantity', isNotSorting: true },
      { Header: <FormattedMessage id="bonus" />, accessor: 'bonus', isNotSorting: true },
      { Header: <FormattedMessage id="discount" />, accessor: 'discount_percent', Cell: (data) => `${data.value}%`, isNotSorting: true },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unit_price',
        Cell: (data) => {
          const unitPrice = data.value || data.row.original.bundle_price;

          return formatThousandSeparator(unitPrice);
        },
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'total',
        Cell: (data) => formatThousandSeparator(data.value),
        isNotSorting: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onBack = () => navigate('/transaction/pet-shop');
  const onSubmit = async () => {
    const responseError = (err) => {
      dispatch(snackbarError(createMessageBackend(err)));
      const { msg, detail } = createMessageBackend(err, true);
      setErrContent({ title: msg, detail: detail });
    };

    const responseSuccess = (resp) => {
      const message = `Transaction has been created successfully`;
      if (resp && resp.status === 200) {
        dispatch(snackbarSuccess(message));
        onBack();
      }
    };

    const isNewCustomer = formValue.customer === 'new';
    const customer = isNewCustomer ? formValue.customerName : formValue.customerName.value;

    try {
      setDisabledOk(true);

      const resp = await createPetShopTransaction({
        isNewCustomer,
        customerId: isNewCustomer ? '' : customer,
        customerName: isNewCustomer ? customer : '',
        registrant: '',
        locationId: formValue.location.value,
        serviceCategory: 'Pet Shop',
        notes: formValue.notes,
        paymentMethod: formValue.paymentMethodSelected.value,
        productList: newTransactionData.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice,
          note: null,
          promoId: null
        })),
        selectedPromos: selectedPromoData
      });

      responseSuccess(resp);
      onBack();
    } catch (error) {
      responseError(error);
    } finally {
      setDisabledOk(false);
    }
  };

  const onSubmitAndPrint = async () => {
    onSubmit();
    // onPrint();
  };

  const clearForm = () => {
    setFormValue(CONSTANT_FORM_VALUE);
    setErrContent({ title: '', detail: '' });
    setIsError(false);
    setFormErrors({
      productSellSelectedError: '',
      productSellMinPriceError: '',
      productSellQuantityError: '',
      productClinicSelectedError: '',
      productClinicMinPriceError: '',
      productClinicQuantityError: ''
    });
    setNewTransactionData([]);
    setNewTransactionSummaryData(null);
    setPromoData(INITIAL_STATE_PROMO);
    setSelectedPromoData(INITIAL_STATE_PROMO);
  };

  const handlePromoChange = (key) => (_, selectedObjects) => {
    const selectedIds = selectedObjects.map((item) => item.id);
    setSelectedPromoData((prev) => ({
      ...prev,
      [key]: selectedIds
    }));
  };

  const getSelectedObjects = (key) => {
    const ids = selectedPromoData[key];
    return promoData[key].filter((item) => ids.includes(item.id));
  };

  const renderPromoAutocomplete = (id, labelId, key) => (
    <Grid>
      <Stack spacing={1}>
        <InputLabel htmlFor={id}>
          <FormattedMessage id={labelId} />
        </InputLabel>
        <Autocomplete
          id={id}
          multiple
          options={promoData[key]}
          value={getSelectedObjects(key)}
          getOptionLabel={(option) => option.name || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onChange={handlePromoChange(key)}
          renderInput={(params) => <TextField {...params} placeholder="Select..." />}
          renderOption={(props, option) => (
            <li {...props} key={option.id}>
              <div>
                <strong>{option.name}</strong>
                <br />
                <small>{option.note}</small>
              </div>
            </li>
          )}
        />
      </Stack>
    </Grid>
  );

  const onSubmitPromo = async () => {
    try {
      const promoResponse = await submitPromoDiscount({
        freeItems: JSON.stringify(selectedPromoData.freeItems),
        discounts: JSON.stringify(selectedPromoData.discounts),
        bundles: JSON.stringify(selectedPromoData.bundles),
        basedSales: JSON.stringify(selectedPromoData.basedSales),
        products: JSON.stringify(
          newTransactionData.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            eachPrice: item.unitPrice,
            priceOverall: item.totalPrice,
            locationId: item.location
          }))
        )
      });

      setNewTransactionSummaryData(promoResponse.data);
      setIsPromoOpen(false);
    } catch (error) {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    }
  };

  return (
    <div>
      <HeaderPageCustom title={<FormattedMessage id="add-transaction" />} />
      <MainCard border={false} boxShadow>
        <ErrorContainer open={Boolean(errContent.title || errContent.detail)} content={errContent} />
        <Grid container spacing={3}>
          {/* Customer Type */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel>
                <FormattedMessage id="new-or-existing-customer" />
              </InputLabel>
              <FormControl fullWidth>
                <Select
                  id="customer"
                  name="customer"
                  value={formValue.customer}
                  onChange={(event) => {
                    setFormValue((e) => ({
                      ...e,
                      customer: event.target.value,
                      location: null
                    }));
                  }}
                  placeholder="Select customer"
                >
                  <MenuItem value="">
                    <em>
                      <FormattedMessage id="select-customer" />
                    </em>
                  </MenuItem>
                  <MenuItem value={'old'}>
                    <FormattedMessage id="customer-old" />
                  </MenuItem>
                  <MenuItem value={'new'}>
                    <FormattedMessage id="customer-new" />
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="location">
                <FormattedMessage id="location" />
              </InputLabel>
              <Autocomplete
                id="location"
                options={getDropdownAll().locationList}
                value={formValue.location}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => {
                  const locationValue = selected ? selected : null;
                  setFormValue((e) => ({ ...e, location: locationValue, customerName: null }));

                  dropdownList.setState((prevState) => ({ ...prevState, customerList: [] }));
                  if (locationValue) {
                    getCustomerByLocation(locationValue.value);
                  }
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          {formValue.customer && (
            <Grid item xs={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="customerName">
                  <FormattedMessage id="customer-name" />
                </InputLabel>
                {formValue.customer === 'old' && (
                  <Autocomplete
                    id="customerName"
                    options={customerList}
                    value={formValue.customerName}
                    isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                    onChange={(_, selected) => {
                      const customerValue = selected ? selected : null;
                      setFormValue((e) => ({ ...e, customerName: customerValue }));
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                )}
                {formValue.customer === 'new' && (
                  <TextField
                    fullWidth
                    id="customerName"
                    name="customerName"
                    value={formValue.customerName || ''}
                    onChange={(event) => onFieldHandler(event)}
                  />
                )}
              </Stack>
            </Grid>
          )}

          {/* Product Sell */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="productSell">
                <FormattedMessage id="product-sell" />
              </InputLabel>
              <Autocomplete
                id="productSell"
                options={getDropdownAll().productSellList}
                value={formValue.productSellSelected}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => {
                  const productSellSelected = selected ? selected : null;
                  const productSellMinPrice = selected ? +selected.data.price : 0;
                  const productSellStock = selected ? +selected.data.inStock : 0;

                  setFormValue((e) => ({
                    ...e,
                    productSellSelected,
                    productSellMinPrice,
                    productSellStock
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(formErrors.productSellSelectedError)}
                    helperText={formErrors.productSellSelectedError}
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Product Sell Price */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="productSellPrice">
                <FormattedMessage id="price" />
              </InputLabel>
              <TextField
                fullWidth
                id="productSellPrice"
                name="productSellPrice"
                value={formValue.productSellPrice || ''}
                onChange={(event) => onFieldHandler(event)}
                error={Boolean(formErrors.productSellMinPriceError)}
                helperText={formErrors.productSellMinPriceError}
              />
            </Stack>
          </Grid>

          {/* Product Sell Quantity */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <InputLabel htmlFor="productSellQuantity">
                  <FormattedMessage id="quantity" />
                </InputLabel>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={11}>
                    <TextField
                      fullWidth
                      id="productSellQuantity"
                      name="productSellQuantity"
                      value={formValue.productSellQuantity || ''}
                      onChange={(event) => onFieldHandler(event)}
                      error={Boolean(formErrors.productSellQuantityError)}
                      helperText={formErrors.productSellQuantityError}
                    />
                  </Grid>
                  <Grid item xs={1} display="flex" justifyContent={'flex-end'}>
                    <IconButton size="medium" variant="contained" color="primary" onClick={addProductSellToTransactionList}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Product Clinic */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="productClinic">
                <FormattedMessage id="product-clinic" />
              </InputLabel>
              <Autocomplete
                id="productClinic"
                options={getDropdownAll().productClinicList}
                value={formValue.productClinicSelected}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => {
                  const productClinicSelected = selected ? selected : null;
                  const productClinicMinPrice = selected ? +selected.data.price : 0;
                  const productClinicStock = selected ? +selected.data.inStock : 0;

                  setFormValue((e) => ({
                    ...e,
                    productClinicSelected,
                    productClinicMinPrice,
                    productClinicStock
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    error={Boolean(formErrors.productClinicSelectedError)}
                    helperText={formErrors.productClinicSelectedError}
                  />
                )}
              />
            </Stack>
          </Grid>

          {/* Product Clinic Price */}
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="productClinicPrice">
                <FormattedMessage id="price" />
              </InputLabel>
              <TextField
                fullWidth
                id="productClinicPrice"
                name="productClinicPrice"
                value={formValue.productClinicPrice || ''}
                onChange={(event) => onFieldHandler(event)}
                error={Boolean(formErrors.productClinicMinPriceError)}
                helperText={formErrors.productClinicMinPriceError}
              />
            </Stack>
          </Grid>

          {/* Product Clinic Quantity */}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <InputLabel htmlFor="productClinicQuantity">
                  <FormattedMessage id="quantity" />
                </InputLabel>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={11}>
                    <TextField
                      fullWidth
                      id="productClinicQuantity"
                      name="productClinicQuantity"
                      value={formValue.productClinicQuantity || ''}
                      onChange={(event) => onFieldHandler(event)}
                      error={Boolean(formErrors.productClinicQuantityError)}
                      helperText={formErrors.productClinicQuantityError}
                    />
                  </Grid>
                  <Grid item xs={1} display="flex" justifyContent={'flex-end'}>
                    <IconButton size="medium" variant="contained" color="primary" onClick={addProductClinicToTransactionList}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} overflow={'auto'}>
            <ReactTable columns={columns} data={newTransactionData} />
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel htmlFor="notes">
                <FormattedMessage id="notes" />
              </InputLabel>
              <TextField
                fullWidth
                multiline
                rows={5}
                id="notes"
                name="notes"
                value={formValue.notes || ''}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Button
              disabled={!newTransactionData.length}
              onClick={() => setIsPromoOpen(true)}
              variant="text"
              sx={{
                color: 'primary.main',
                padding: 1,
                minWidth: 0
              }}
            >
              Promo yang dapat diberikan
            </Button>
          </Grid>

          {newTransactionSummaryData && (
            <Grid item xs={12} overflow={'auto'}>
              <Stack spacing={2}>
                <h3>Ringkasan</h3>
                <ReactTable columns={summaryColumns} data={newTransactionSummaryData.purchases} />

                <Box item sx={{ paddingRight: 8 }} fontWeight={'bold'} fontSize={16}>
                  <Stack spacing={1}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent={{ xs: 'start', sm: 'end' }}
                      alignItems={{ xs: 'start', sm: 'unset' }}
                    >
                      <div>Subtotal:</div>
                      <Box
                        sx={{
                          width: {
                            xs: '100%',
                            sm: 200
                          },
                          minWidth: {
                            xs: 'auto',
                            sm: 200
                          },
                          textAlign: {
                            xs: 'auto',
                            sm: 'right'
                          }
                        }}
                      >
                        Rp {formatThousandSeparator(newTransactionSummaryData.subtotal)}
                      </Box>
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent={{ xs: 'start', sm: 'end' }}
                      alignItems={{ xs: 'start', sm: 'unset' }}
                    >
                      <div>{newTransactionSummaryData.discount_note}:</div>
                      <Box
                        sx={{
                          width: {
                            xs: '100%',
                            sm: 200
                          },
                          minWidth: {
                            xs: 'auto',
                            sm: 200
                          },
                          textAlign: {
                            xs: 'auto',
                            sm: 'right'
                          }
                        }}
                      >
                        Rp -{formatThousandSeparator(newTransactionSummaryData.total_discount)}
                      </Box>
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent={{ xs: 'start', sm: 'end' }}
                      alignItems={{ xs: 'start', sm: 'unset' }}
                    >
                      <div>
                        <FormattedMessage id="total-payment" />:
                      </div>
                      <Box
                        sx={{
                          width: {
                            xs: '100%',
                            sm: 200
                          },
                          minWidth: {
                            xs: 'auto',
                            sm: 200
                          },
                          textAlign: {
                            xs: 'auto',
                            sm: 'right'
                          }
                        }}
                      >
                        Rp {formatThousandSeparator(newTransactionSummaryData.total_payment)}
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>

              <Box>
                <h3>Keterangan Promo:</h3>

                <ul>
                  {newTransactionSummaryData.promo_notes.map((note, index) => (
                    <li key={note + index}>{note}</li>
                  ))}
                </ul>
              </Box>
            </Grid>
          )}
          <Grid item xs={12}>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <InputLabel htmlFor="paymentMethod">
                  <FormattedMessage id="payment-method" />
                </InputLabel>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={11}>
                    <Autocomplete
                      id="paymentMethod"
                      options={getDropdownAll().paymentMethodList}
                      value={formValue.paymentMethod}
                      isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                      onChange={(_, selected) => {
                        const paymentMethodSelected = selected ? selected : null;

                        setFormValue((e) => ({
                          ...e,
                          paymentMethodSelected
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </Grid>
                  <Grid item xs={1} display="flex" justifyContent={'flex-end'}>
                    <IconButton size="medium" variant="contained" color="primary" onClick={onAddPaymentMethod}>
                      <PlusOutlined />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ marginTop: 5 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={clearForm}>
                {<FormattedMessage id="clear" />}
              </Button>
              <Button variant="contained" className="button__submit" color="error" type="button" onClick={onBack}>
                {<FormattedMessage id="back" />}
              </Button>
              <Button variant="contained" className="button__primary button__submit" onClick={onSubmitAndPrint} disabled={disabledOk}>
                {<FormattedMessage id="save-and-print" />}
              </Button>
              <Button variant="contained" className="button__primary button__submit" onClick={onSubmit} disabled={disabledOk}>
                {<FormattedMessage id="save" />}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      <FormPaymentMethod open={openFormPaymentMethod} onClose={onCloseFormPaymentMethod} />

      {isPromoOpen && (
        <ModalC
          title={<FormattedMessage id="promo-available" />}
          open={isPromoOpen}
          onOk={onSubmitPromo}
          onCancel={() => setIsPromoOpen(false)}
          fullWidth
          maxWidth="sm"
          otherDialogAction={
            <>
              <Button disabled={disabledOk} variant="outlined" onClick={() => setSelectedPromoData(INITIAL_STATE_PROMO)}>
                {<FormattedMessage id="reset-all" />}
              </Button>
            </>
          }
        >
          <Stack spacing={2}>
            {renderPromoAutocomplete('freeItems', 'free-product', 'freeItems')}
            {renderPromoAutocomplete('discounts', 'discount', 'discounts')}
            {renderPromoAutocomplete('bundles', 'bundle', 'bundles')}
            {renderPromoAutocomplete('basedSales', 'based-on-purchase', 'basedSales')}
          </Stack>
        </ModalC>
      )}
    </div>
  );
}
