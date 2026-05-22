import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormattedMessage, useIntl } from 'react-intl';
import { Autocomplete, Button, Divider, Grid, InputLabel, Stack, Tab, Tabs, TextField, Box, Typography } from '@mui/material';
import { LocalizationProvider, DesktopDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';
import { getStockOpnameDetail } from '../service';
import { submitStockOpnameProducts } from './service';
import useAuth from 'hooks/useAuth';
import dayjs from 'dayjs';

import HeaderPageCustom from 'components/@extended/HeaderPageCustom';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import ProductList from './product-list';
import BarcodeInput from './input-barcode';
import ManualInput from './input-manual';
import ConfirmationC from 'components/ConfirmationC';

const StockOpnameInputProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const intl = useIntl();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [detail, setDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [confirmSave, setConfirmSave] = useState(false);

  useEffect(() => {
    getStockOpnameDetail(id)
      .then((resp) => {
        setDetail(resp.data);
        const existing = (resp.data.products ?? []).map((p) => ({
          productId: p.productId,
          productName: p.fullName ?? p.productName,
          sku: p.sku ?? '',
          stockSystem: p.stockSystem ?? p.systemQuantity ?? 0,
          stockPhysical: p.stockPhysical ?? p.actualQuantity ?? '',
          difference: p.difference ?? '',
          note: p.note ?? ''
        }));
        setProducts(existing);
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err)));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const addProduct = (product) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p.productId === product.productId);
      if (exists) return prev;
      return [...prev, { ...product, stockPhysical: '', note: '' }];
    });
  };

  const updateProduct = useCallback((productId, field, value) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.productId !== productId) return p;
        const updated = { ...p, [field]: value };
        updated.difference = (Number(updated.stockPhysical) || 0) - (updated.stockSystem || 0);
        return updated;
      })
    );
  }, []);

  const removeProduct = useCallback((productId) => {
    setProducts((prev) => prev.filter((p) => p.productId !== productId));
  }, []);

  const buildPayload = () => {
    const inputedAt = dayjs().format('YYYY-MM-DD HH:mm:ss');
    return products.map((p) => {
      const stockPhysical = Number(p.stockPhysical) || 0;
      const difference = stockPhysical - (p.stockSystem || 0);
      return {
        stockOpnameId: +id,
        productId: p.productId,
        stockSystem: p.stockSystem ?? 0,
        stockPhysical,
        difference,
        status: difference === 0 ? 1 : 2,
        note: p.note ?? '',
        inputedBy: user?.id ?? null,
        inputedAt
      };
    });
  };

  const onSaveAsDraft = async () => {
    await submitStockOpnameProducts(buildPayload(), 'draft')
      .then((resp) => {
        if (resp.status === 200) {
          dispatch(snackbarSuccess('Saved as draft'));
          navigate('/product/stockopname', { replace: true });
        }
      })
      .catch((err) => {
        if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
      });
  };

  const onConfirmSave = async (value) => {
    if (value) {
      await submitStockOpnameProducts(buildPayload(), 'submit')
        .then((resp) => {
          if (resp.status === 200) {
            dispatch(snackbarSuccess('Products submitted successfully'));
            navigate('/product/stockopname', { replace: true });
          }
        })
        .catch((err) => {
          if (err) dispatch(snackbarError(createMessageBackend(err, true, true)));
        });
    }
    setConfirmSave(false);
  };

  const locationValue = detail ? { label: detail.locationName ?? '', value: detail.locationId } : null;
  const usersValue = detail?.users ? detail.users.map((u) => ({ label: u.name, value: u.id })) : [];

  return (
    <>
      <HeaderPageCustom
        title={<FormattedMessage id="input-product" />}
        locationBackConfig={{ setLocationBack: true, customUrl: '/product/stockopname' }}
      />

      <MainCard>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel><FormattedMessage id="stock-opname-number" /></InputLabel>
              <TextField fullWidth value={detail?.stockOpnameNumber ?? ''} disabled />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel><FormattedMessage id="title" /></InputLabel>
              <TextField fullWidth value={detail?.title ?? ''} disabled />
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel><FormattedMessage id="start-time" /></InputLabel>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DesktopDateTimePicker
                  value={detail?.startTime ? dayjs(detail.startTime) : null}
                  disabled
                  renderInput={(params) => <TextField {...params} variant="outlined" />}
                />
              </LocalizationProvider>
            </Stack>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Stack spacing={1}>
              <InputLabel><FormattedMessage id="location" /></InputLabel>
              <Autocomplete
                options={locationValue ? [locationValue] : []}
                value={locationValue}
                disabled
                isOptionEqualToValue={(option, val) => option.value === val.value}
                renderInput={(params) => <TextField {...params} />}
              />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack spacing={1}>
              <InputLabel><FormattedMessage id="users" /></InputLabel>
              <Autocomplete
                multiple
                limitTags={3}
                options={usersValue}
                value={usersValue}
                disabled
                isOptionEqualToValue={(option, val) => option.value === val.value}
                renderInput={(params) => <TextField {...params} placeholder={intl.formatMessage({ id: 'select-users' })} />}
              />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>

      <MainCard sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              <FormattedMessage id="barcode-input" />
            </Typography>
            <BarcodeInput locationId={detail?.locationId ? +detail.locationId : null} onAdd={addProduct} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              <FormattedMessage id="manual-input" />
            </Typography>
            <ManualInput locationId={detail?.locationId ? +detail.locationId : null} onAdd={addProduct} />
          </Grid>

          {products.length > 0 && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <ScrollX>
                <ProductList products={products} onUpdate={updateProduct} onRemove={removeProduct} />
              </ScrollX>
              <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
                <Button variant="outlined" color="primary" onClick={onSaveAsDraft}>
                  <FormattedMessage id="save-as-draft" />
                </Button>
                <Button variant="contained" color="primary" onClick={() => setConfirmSave(true)}>
                  <FormattedMessage id="save" />
                </Button>
              </Stack>
            </Grid>
          )}
        </Grid>
      </MainCard>

      {confirmSave && (
        <ConfirmationC
          open={confirmSave}
          title={<FormattedMessage id="save" />}
          content={<FormattedMessage id="are-you-sure-you-want-to-save-this-data" />}
          onClose={onConfirmSave}
          btnTrueText="Ok"
          btnFalseText="Cancel"
        />
      )}
    </>
  );
};

export default StockOpnameInputProduct;
