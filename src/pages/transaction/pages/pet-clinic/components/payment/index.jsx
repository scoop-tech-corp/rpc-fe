import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Autocomplete, Button, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, useMediaQuery } from '@mui/material';
import {
  checkPromoTransactionPetClinic,
  createPaymentPetClinicOutpatient,
  getBeforePayment,
  printInvoicePetClinicOutpatient
} from '../../service';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useTheme } from '@mui/material/styles';
import { createMessageBackend, getServiceListByLocation, processDownloadPDF } from 'service/service-global';
import { getProductSellDropdown } from 'pages/product/product-list/service';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import SummaryTable from './summary-table';
import PromoOfferTransactionPetClinic from './promo-offer';

const Payment = (props) => {
  const { data } = props;
  const [formValue, setFormValue] = useState({
    customerName: '',
    phoneNumber: '',
    arrivalTime: '',
    productSell: null,
    unitPriceProductSell: '',
    quantityProductSell: '',
    service: null,
    unitPriceService: '',
    quantityService: '',
    notes: '',
    unitPriceServiceErr: '',
    unitPriceProductSellErr: '',
    quantityProductSellErr: '',
    productSellDropdownList: [],
    serviceDropdownList: [],
    recipeList: [],
    serviceList: [],
    productList: [],
    summaryList: [],
    summarySubtotal: 0,
    summaryDiscountNote: '',
    summaryTotalDiscount: 0,
    summaryTotalPayment: 0,
    summaryPromoNotes: [],
    promoBasedSaleId: '',
    discountBasedSales: 0,
    paymentMethod: '',
    dpNominal: '',
    dpNominalErr: '',
    dpNextPayment: null,
    installmentDuration: '',
    installmentTenor: '',
    installmentDp: ''
  });
  const [disabledOke, setDisabledOk] = useState(false);
  const [promoOfferDialog, setPromoOfferDialog] = useState({ isOpen: false, data: {} });
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));
  const intl = useIntl();
  const dispatch = useDispatch();
  const errorMessageUnitPriceExceedBasePrice = intl.formatMessage({ id: 'unit-price-mus-not-exceed-base-price' });

  useEffect(() => {
    const fetchData = async () => {
      // getInpatientTransactionPetClinic(data.transactionId)
      Promise.all([
        getBeforePayment(data.transactionId),
        getServiceListByLocation([data.locationId]),
        getProductSellDropdown(data.locationId)
      ]).then(([respBeforePayment, respService, respProductSell]) => {
        const beforePaymentData = respBeforePayment.data;

        // Before Payment Assign Data
        const { recipes, services } = beforePaymentData.data;
        const customerName = beforePaymentData.customerName;
        const phoneNumber = beforePaymentData.phoneNumber;
        const arrivalTime = beforePaymentData.arrivalTime;
        const new_recipes = (recipes || []).map((dt) => ({
          ...dt,
          productId: +dt.productId,
          unitPrice: '',
          totalPrice: '',
          unitPriceErr: ''
        }));
        const new_services = (services || []).map((dt) => ({
          ...dt,
          serviceId: +dt.serviceId,
          basedPrice: +dt.basedPrice.replace(/,/g, ''),
          unitPrice: '',
          totalPrice: '',
          unitPriceErr: ''
        }));
        const set_value_before_payment = {
          customerName,
          phoneNumber,
          arrivalTime,
          recipeList: new_recipes,
          serviceList: new_services
        };

        const new_service_dropdown_list = [...respService].map((dt) => ({ ...dt, label: `${dt.label} - ${dt.price}`, name: dt.label }));
        const new_product_sell_list = [...respProductSell].map((dt) => ({ ...dt, label: `${dt.label} - ${dt.data.price}` }));

        setFormValue((prevState) => ({
          ...prevState,
          ...set_value_before_payment,
          serviceDropdownList: new_service_dropdown_list,
          productSellDropdownList: new_product_sell_list
        }));
      });
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const findRecipeErr = formValue.recipeList.find((dt) => dt.unitPriceErr);
    const findServiceErr = formValue.serviceList.find((dt) => dt.unitPriceErr);
    if (findRecipeErr || findServiceErr || formValue.dpNominalErr) setDisabledOk(true);
    else setDisabledOk(false);
  }, [formValue]);

  const columnsRecipe = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => data.row.index + 1
      },
      {
        Header: <FormattedMessage id="product" />,
        accessor: 'productName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="dosage" />,
        accessor: 'dosage',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit" />,
        accessor: 'unit',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="frequency" />,
        accessor: 'frequency',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="duration" />,
        accessor: 'duration',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="medication" />,
        accessor: 'giveMedicine',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="notes" />,
        accessor: 'notes',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="based-price" />,
        accessor: 'basedPrice',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true,
        Cell: (data) => {
          const rowIndex = data.row.index;
          const rowUnitPriceErr = data.row.original.unitPriceErr;

          const onRecipeUnitPrice = (event) => {
            const unitPriceValue = +event.target.value;
            const dosage = +data.row.original.dosage;
            const frequency = +data.row.original.frequency;
            const duration = +data.row.original.duration; // lama pengguna
            const basedPrice = +data.row.original.basedPrice;
            const recipeTotalPrice = dosage * frequency * duration * unitPriceValue;

            setFormValue((prevState) => {
              const currentRecipeList = [...prevState.recipeList];
              const updatedRecipe = { ...currentRecipeList[rowIndex] };

              updatedRecipe.unitPrice = unitPriceValue;
              updatedRecipe.totalPrice = recipeTotalPrice;
              updatedRecipe.unitPriceErr = unitPriceValue > basedPrice ? errorMessageUnitPriceExceedBasePrice : '';

              currentRecipeList[rowIndex] = updatedRecipe;

              return { ...prevState, recipeList: currentRecipeList };
            });
          };

          return (
            <>
              <TextField
                fullWidth
                type="number"
                id="unitPrice"
                name="unitPrice"
                inputProps={{ min: 0 }}
                value={data.row.original.unitPrice || ''}
                onChange={(event) => onRecipeUnitPrice(event)}
                error={Boolean(rowUnitPriceErr && rowUnitPriceErr.length > 0)}
                helperText={rowUnitPriceErr}
              />
            </>
          );
        }
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'totalPrice',
        isNotSorting: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [intl] // formValue.recipeList, intl
  );

  const columnsService = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => data.row.index + 1
      },
      {
        Header: <FormattedMessage id="service-name" />,
        accessor: 'serviceName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="based-price" />,
        accessor: 'basedPrice',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true,
        Cell: (data) => {
          const rowIndex = data.row.index;
          const rowUnitPriceErr = data.row.original.unitPriceErr;

          const onRecipeUnitPrice = (event) => {
            const unitPriceValue = +event.target.value;
            const quantity = +data.row.original.quantity;
            const basedPrice = +data.row.original.basedPrice;
            const serviceTotalPrice = unitPriceValue * quantity;

            setFormValue((prevState) => {
              const currentServiceList = [...prevState.serviceList];
              const updatedService = { ...currentServiceList[rowIndex] };

              updatedService.unitPrice = unitPriceValue;
              updatedService.totalPrice = serviceTotalPrice;
              updatedService.unitPriceErr = unitPriceValue > basedPrice ? errorMessageUnitPriceExceedBasePrice : '';

              currentServiceList[rowIndex] = updatedService;

              return { ...prevState, serviceList: currentServiceList };
            });
          };

          return (
            <>
              <TextField
                fullWidth
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={data.row.original.unitPrice || ''}
                onChange={(event) => onRecipeUnitPrice(event)}
                error={Boolean(rowUnitPriceErr && rowUnitPriceErr.length > 0)}
                helperText={rowUnitPriceErr}
              />
            </>
          );
        }
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'totalPrice',
        isNotSorting: true
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const columnProduct = useMemo(
    () => [
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => data.row.index + 1
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'productName',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unitPrice',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'totalPrice',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="delete" />,
        accessor: 'delete',
        isNotSorting: true,
        Cell: (data) => {
          const rowIndex = data.row.index;

          return (
            <IconButton
              size="medium"
              variant="contained"
              aria-label="refresh"
              color="error"
              onClick={() => onDeleteRowHandler('productList', rowIndex)}
            >
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  const onFieldHandler = (event) => setFormValue((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  const onAddService = () => {
    setFormValue((prevState) => {
      const currentServiceList = [...prevState.serviceList];
      const serviceBasedPrice = prevState.service?.price; // based price / harga dasar
      const qtyService = prevState.quantityService;
      const serviceUnitPrice = prevState.unitPriceService;

      const newRow = {
        serviceId: prevState.service?.value,
        serviceName: prevState.service?.name,
        quantity: qtyService,
        basedPrice: serviceBasedPrice,
        unitPrice: serviceUnitPrice,
        totalPrice: qtyService * serviceUnitPrice
      };

      return {
        ...prevState,
        service: null,
        unitPriceService: '',
        quantityService: '',
        serviceList: [...currentServiceList, newRow]
      };
    });
  };
  const onDisabledService = () =>
    Boolean(!formValue.service || !formValue.unitPriceService || !formValue.quantityService || formValue.unitPriceServiceErr);
  const onAddProductSell = () => {
    setFormValue((prevState) => {
      const currentProductList = [...prevState.productList];
      const productSellBasedPrice = +prevState.productSell?.data.price; // based price / harga dasar
      const qtyProductSell = +prevState.quantityProductSell;
      const productSellUnitPrice = +prevState.unitPriceProductSell;

      const newRow = {
        productId: prevState.productSell.value,
        productName: prevState.productSell?.data.fullName,
        quantity: qtyProductSell,
        basedPrice: productSellBasedPrice,
        unitPrice: productSellUnitPrice,
        totalPrice: qtyProductSell * productSellUnitPrice
      };

      return {
        ...prevState,
        productSell: null,
        unitPriceProductSell: '',
        quantityProductSell: '',
        productList: [...currentProductList, newRow]
      };
    });
  };
  const onDisabledProductSell = () =>
    Boolean(
      !formValue.productSell ||
        !formValue.unitPriceProductSell ||
        !formValue.quantityProductSell ||
        formValue.unitPriceProductSellErr ||
        formValue.quantityProductSellErr
    );
  const onDeleteRowHandler = (procedure, rowIndex) => {
    setFormValue((prevState) => {
      const prevTableList = prevState[procedure];
      prevTableList.splice(rowIndex, 1);

      return { ...prevState, [procedure]: [...prevTableList] };
    });
  };

  const minimumDownPaymentNominal = () => {
    return (20 / 100) * formValue.summaryTotalPayment;
  };

  const onSubmit = async () => {
    try {
      await createPaymentPetClinicOutpatient(data.transactionId, formValue);
      const resp = await printInvoicePetClinicOutpatient(data.transactionId, formValue);
      console.log('resp PRINT', resp);
      const message = `Transaction Payment Pet Clinic has been successfully`;
      if (resp && resp.status === 200) {
        processDownloadPDF(resp);
        dispatch(snackbarSuccess(message));
        props.onClose(true);
      }
    } catch (error) {
      dispatch(snackbarError(createMessageBackend(error)));
    }
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="payment-pet-clinic-inpatient" />}
        open={props.open}
        onOk={() => onSubmit()}
        disabledOk={disabledOke}
        okText={<FormattedMessage id="save-and-print" />}
        onCancel={() => props.onClose(false)}
        fullWidth
        maxWidth="xl"
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="customer-name">
                <FormattedMessage id="customer-name" />
              </InputLabel>
              {formValue.customerName}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="phone-number">
                <FormattedMessage id="phone-number" />
              </InputLabel>
              {formValue.phoneNumber}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="arrival-time">
                <FormattedMessage id="arrival-time" />
              </InputLabel>
              {formValue.arrivalTime}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="recipe" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="recipe" />
              </InputLabel>
              <ScrollX>
                <ReactTable columns={columnsRecipe} data={formValue.recipeList || []} colSpanPagination={11} />
              </ScrollX>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="service">
                <FormattedMessage id="service" />
              </InputLabel>
              <Autocomplete
                id="service"
                name="service"
                options={formValue.serviceDropdownList}
                value={formValue.service}
                isOptionEqualToValue={(option, val) => val === '' || option.id === val.id}
                onChange={(_, selected) => {
                  const selectedValue = selected ? { ...selected, value: +selected.id } : null;
                  onFieldHandler({ target: { name: 'service', value: selectedValue } });
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="unit-price">
                <FormattedMessage id="unit-price" />
              </InputLabel>
              <TextField
                fullWidth
                type="number"
                id="unitPriceService"
                name="unitPriceService"
                value={formValue.unitPriceService}
                inputProps={{ min: 0 }}
                onChange={(event) => {
                  onFieldHandler(event);
                  setFormValue((prevState) => {
                    return {
                      ...prevState,
                      unitPriceServiceErr: +event.target.value > +prevState.service?.price ? errorMessageUnitPriceExceedBasePrice : ''
                    };
                  });
                }}
                error={Boolean(formValue.unitPriceServiceErr && formValue.unitPriceServiceErr.length > 0)}
                helperText={formValue.unitPriceServiceErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={11}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="quantity">
                <FormattedMessage id="quantity" />
              </InputLabel>
              <TextField
                fullWidth
                type="number"
                id="quantityService"
                name="quantityService"
                value={formValue.quantityService}
                inputProps={{ min: 0 }}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              style={{ width: matchDownSM ? '100%' : 'unset' }}
              size="medium"
              variant="contained"
              aria-label="refresh"
              color="primary"
              onClick={onAddService}
              disabled={onDisabledService()}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="service" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="service" />
              </InputLabel>
              <ScrollX>
                <ReactTable columns={columnsService} data={formValue.serviceList || []} />
              </ScrollX>
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product-sell">
                <FormattedMessage id="product-sell" />
              </InputLabel>
              <Autocomplete
                id="productSell"
                name="productSell"
                options={formValue.productSellDropdownList}
                value={formValue.productSell}
                isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
                onChange={(_, selected) => {
                  const selectedValue = selected ? { ...selected, value: +selected.value } : null;
                  onFieldHandler({ target: { name: 'productSell', value: selectedValue } });
                }}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="unit-price">
                <FormattedMessage id="unit-price" />
              </InputLabel>
              <TextField
                fullWidth
                type="number"
                id="unitPriceProductSell"
                name="unitPriceProductSell"
                value={formValue.unitPriceProductSell}
                inputProps={{ min: 0 }}
                onChange={(event) => {
                  onFieldHandler(event);
                  setFormValue((prevState) => {
                    return {
                      ...prevState,
                      unitPriceProductSellErr:
                        +event.target.value > +prevState.productSell?.data.price ? errorMessageUnitPriceExceedBasePrice : ''
                    };
                  });
                }}
                error={Boolean(formValue.unitPriceProductSellErr && formValue.unitPriceProductSellErr.length > 0)}
                helperText={formValue.unitPriceProductSellErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={11}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="quantity">
                <FormattedMessage id="quantity" />
              </InputLabel>
              <TextField
                fullWidth
                type="number"
                id="quantityProductSell"
                name="quantityProductSell"
                value={formValue.quantityProductSell}
                inputProps={{ min: 0 }}
                onChange={(event) => {
                  onFieldHandler(event);
                  setFormValue((prevState) => {
                    const inStock = +prevState.productSell?.data.inStock;
                    return {
                      ...prevState,
                      quantityProductSellErr: +event.target.value > inStock ? `Quantity exceeds stock. Only ${inStock} left in stock.` : ''
                    };
                  });
                }}
                error={Boolean(formValue.quantityProductSellErr && formValue.quantityProductSellErr.length > 0)}
                helperText={formValue.quantityProductSellErr}
              />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={1} display={'flex'} alignItems={'flex-end'} justifyContent={'center'}>
            <IconButton
              style={{ width: matchDownSM ? '100%' : 'unset' }}
              size="medium"
              variant="contained"
              aria-label="refresh"
              color="primary"
              onClick={onAddProductSell}
              disabled={onDisabledProductSell()}
            >
              <PlusOutlined />
            </IconButton>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="product" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="product" />
              </InputLabel>
              <ScrollX>
                <ReactTable columns={columnProduct} data={formValue.productList || []} />
              </ScrollX>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="notes">
                <FormattedMessage id="notes" />
              </InputLabel>
              <TextField
                multiline
                fullWidth
                rows={5}
                id="notes"
                name="notes"
                value={formValue.notes}
                onChange={(event) => onFieldHandler(event)}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="info"
              type="button"
              onClick={async () => {
                console.log('recipeList', formValue.recipeList);
                console.log('serviceList', formValue.serviceList);
                console.log('productList', formValue.productList);
                const recipes = [...formValue.recipeList].map((dt) => ({
                  productId: +dt.productId,
                  dosage: +dt.dosage,
                  unit: dt.unit,
                  frequency: +dt.frequency,
                  duration: +dt.duration,
                  giveMedicine: dt.giveMedicine,
                  notes: dt.notes,
                  eachPrice: +dt.unitPrice,
                  priceOverall: +dt.totalPrice
                }));
                const services = [...formValue.serviceList].map((dt) => ({
                  serviceId: +dt.serviceId,
                  quantity: +dt.quantity,
                  eachPrice: +dt.unitPrice,
                  priceOverall: +dt.totalPrice
                }));

                const products = [...formValue.productList].map((dt) => ({
                  productId: dt.productId,
                  quantity: dt.quantity,
                  eachPrice: +dt.unitPrice,
                  priceOverall: +dt.totalPrice
                }));

                const getRespPromo = await checkPromoTransactionPetClinic({
                  transactionPetClinicId: data.transactionId,
                  recipes,
                  services,
                  products
                });

                const { freeItem, discount, bundles, basedSales } = getRespPromo.data;

                setPromoOfferDialog({
                  isOpen: true,
                  data: {
                    transactionPetClinicId: data.transactionId,
                    freeItems: freeItem,
                    discounts: discount,
                    bundles,
                    basedSales,
                    recipes,
                    services,
                    products
                  }
                });
              }}
            >
              <FormattedMessage id="promotion-can-be-offered" />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="summary" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="summary" />
              </InputLabel>
              <SummaryTable formValue={formValue} />
            </Stack>
          </Grid>

          {Boolean(formValue.summaryPromoNotes.length) && (
            <Grid item xs={12}>
              <Stack spacing={1.25}>
                <InputLabel htmlFor="promotion_details" style={{ fontWeight: 'bold' }}>
                  <FormattedMessage id="promotion_details" />
                </InputLabel>
                <ul>
                  {formValue.summaryPromoNotes.map((item, idx) => (
                    <li key={item + idx}>{item}</li>
                  ))}
                </ul>
              </Stack>
            </Grid>
          )}

          <Grid item xs={6}>
            <Stack spacing={1.25}>
              <InputLabel htmlFor="payment-method" style={{ fontWeight: 'bold' }}>
                <FormattedMessage id="payment-method" />
              </InputLabel>
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <Select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formValue.paymentMethod}
                  onChange={(event) => {
                    setFormValue((prevState) => ({
                      ...prevState,
                      dpNominal: '',
                      dpNominalErr: '',
                      paymentMethod: event.target.value
                    }));
                  }}
                  placeholder="Select metode pembayaran"
                >
                  <MenuItem value="">
                    <em>Select metode pembayaran</em>
                  </MenuItem>
                  <MenuItem value={'full'}>Full Payment</MenuItem>
                  <MenuItem value={'dp'}>DP + Pelunasan</MenuItem>
                  <MenuItem value={'cicilan'}>Cicilan</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          {formValue.paymentMethod === 'dp' && (
            <>
              <Grid item xs={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="dp-nominal" style={{ fontWeight: 'bold' }}>
                    DP Nominal
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="dpNominal"
                    name="dpNominal"
                    value={formValue.dpNominal}
                    inputProps={{ min: minimumDownPaymentNominal() }}
                    onChange={(event) => {
                      onFieldHandler(event);
                      setFormValue((prevState) => {
                        return {
                          ...prevState,
                          dpNominalErr:
                            +event.target.value < minimumDownPaymentNominal()
                              ? `Minimum down payment is ${minimumDownPaymentNominal()}.`
                              : ''
                        };
                      });
                    }}
                    error={Boolean(formValue.dpNominalErr && formValue.dpNominalErr.length > 0)}
                    helperText={formValue.dpNominalErr}
                  />
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="next-payment">
                    <FormattedMessage id="next-payment" />
                  </InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DesktopDatePicker
                      disablePast
                      inputFormat="DD/MM/YYYY"
                      value={formValue.dpNextPayment}
                      onChange={(selectedDate) => {
                        onFieldHandler({ target: { name: 'dpNextPayment', value: selectedDate } });
                      }}
                      renderInput={(params) => <TextField {...params} />}
                    />
                  </LocalizationProvider>
                </Stack>
              </Grid>
            </>
          )}

          {formValue.paymentMethod === 'cicilan' && (
            <>
              <Grid item xs={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="duration" style={{ fontWeight: 'bold' }}>
                    <FormattedMessage id="duration" />
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id="installmentDuration"
                      name="installmentDuration"
                      value={formValue.installmentDuration}
                      onChange={(event) => {
                        setFormValue((prevState) => ({
                          ...prevState,
                          installmentDuration: event.target.value
                        }));
                      }}
                      placeholder="Select metode pembayaran"
                    >
                      <MenuItem value="">
                        <em>Select Durasi</em>
                      </MenuItem>
                      <MenuItem value={'harian'}>Harian</MenuItem>
                      <MenuItem value={'mingguan'}>Mingguan</MenuItem>
                      <MenuItem value={'bulanan'}>Bulanan</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="tenor" style={{ fontWeight: 'bold' }}>
                    Tenor
                  </InputLabel>
                  <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      id="installmentTenor"
                      name="installmentTenor"
                      value={formValue.installmentTenor}
                      onChange={(event) => {
                        setFormValue((prevState) => ({
                          ...prevState,
                          installmentTenor: event.target.value
                        }));
                      }}
                      placeholder="Select Tenor"
                    >
                      <MenuItem value="">
                        <em>Select Tenor</em>
                      </MenuItem>
                      {Array.from({ length: 6 }, (_, i) => i + 1).map((num) => (
                        <MenuItem key={num} value={num}>
                          {num}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={6}>
                <Stack spacing={1.25}>
                  <InputLabel htmlFor="installmentDp" style={{ fontWeight: 'bold' }}>
                    Cicilan Uang Muka
                  </InputLabel>
                  <TextField
                    fullWidth
                    type="number"
                    id="installmentDp"
                    name="installmentDp"
                    value={formValue.installmentDp}
                    inputProps={{ min: 0 }}
                    onChange={(event) => onFieldHandler(event)}
                  />
                </Stack>
              </Grid>
            </>
          )}
        </Grid>
      </ModalC>

      {promoOfferDialog.isOpen && (
        <PromoOfferTransactionPetClinic
          open={promoOfferDialog.isOpen}
          data={promoOfferDialog.data}
          onClose={(resp) => {
            if (resp) {
              const summaryList = resp.purchases.map((dt) => ({
                ...dt,
                included_items: dt.included_items?.map((detail) => ({
                  ...detail,
                  item_name: `${detail.name} (harga normal Rp ${detail.normal_price || '-'})`
                }))
              }));

              setFormValue((prevState) => ({
                ...prevState,
                summaryList,
                summarySubtotal: resp.subtotal,
                summaryDiscountNote: resp.discount_note,
                summaryTotalDiscount: resp.total_discount,
                summaryTotalPayment: resp.total_payment,
                summaryPromoNotes: resp.promo_notes,
                discountBasedSale: resp.discount_based_sales,
                promoBasedSaleId: +resp.promoBasedSaleId
              }));
            }

            setPromoOfferDialog({ isOpen: false, data: {} });
          }}
        />
      )}
    </>
  );
};

Payment.propTypes = {
  open: PropTypes.bool,
  data: PropTypes.object,
  onClose: PropTypes.func
};

export default Payment;
