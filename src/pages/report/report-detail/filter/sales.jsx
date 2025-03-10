import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import MultiSelectAll from 'components/MultiSelectAll';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

export default function FilterSales({ extData, filter, setFilter }) {
  const [isReset, setIsReset] = useState(false);
  let [searchParams] = useSearchParams();
  let detail = searchParams.get('detail');

  return (
    <>
      <Grid container spacing={2} width={'100%'}>
        <Grid item sm={12} xs={12} md={9}>
          <Grid container spacing={2}>
            <Grid item sm={12} xs={12} md={4}>
              <DateRangePicker
                onChange={(value) => setFilter((e) => ({ ...e, date: value }))}
                value={filter.date}
                format="dd/MM/yyy"
                className={'fullWidth'}
              />
            </Grid>
            {['items', 'by-product'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <TextField
                  fullWidth
                  label={<FormattedMessage id="search" />}
                  id="filter-search"
                  name="filter-search"
                  value={filter.search}
                  onChange={(event) => setFilter((e) => ({ ...e, search: event.target.value }))}
                />
              </Grid>
            )}
            <Grid item sm={12} xs={12} md={4}>
              <MultiSelectAll
                items={extData?.location || []}
                limitTags={1}
                value={filter?.location}
                key={'filter-location'}
                selectAllLabel="Select All"
                onChange={(val) => setFilter((e) => ({ ...e, location: val }))}
                isReset={isReset}
                setIsReset={setIsReset}
                label={<FormattedMessage id="location" />}
              />
            </Grid>
            <Grid item sm={12} xs={12} md={4}>
              <MultiSelectAll
                items={extData?.status || []}
                limitTags={1}
                value={filter?.status}
                key={'filter-status'}
                selectAllLabel="Select All"
                onChange={(val) => setFilter((e) => ({ ...e, status: val }))}
                isReset={isReset}
                setIsReset={setIsReset}
                label={<FormattedMessage id="status" />}
              />
            </Grid>
            <Grid item sm={12} xs={12} md={4}>
              <MultiSelectAll
                items={extData?.payment || []}
                limitTags={1}
                value={filter?.payment}
                key={'filter-payment'}
                selectAllLabel="Select All"
                onChange={(val) => setFilter((e) => ({ ...e, payment: val }))}
                isReset={isReset}
                setIsReset={setIsReset}
                label={<FormattedMessage id="payment" />}
              />
            </Grid>
            {['items'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.itemType || []}
                  limitTags={1}
                  value={filter?.itemType}
                  key={'filter-itemType'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, itemType: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="item-type" />}
                />
              </Grid>
            )}
            {['items'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.productCategory || []}
                  limitTags={1}
                  value={filter?.productCategory}
                  key={'filter-productCategory'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, productCategory: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="product-category" />}
                />
              </Grid>
            )}
            {['items', 'by-product', 'by-service', 'payment-list'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.staff || []}
                  limitTags={1}
                  value={filter?.staff}
                  key={'filter-staff'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, staff: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="staff" />}
                />
              </Grid>
            )}

            {['by-service'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.category || []}
                  limitTags={1}
                  value={filter?.category}
                  key={'filter-category'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, category: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="category" />}
                />
              </Grid>
            )}
            {['payment-list'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.method || []}
                  limitTags={1}
                  value={filter?.method}
                  key={'filter-method'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, method: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="method" />}
                />
              </Grid>
            )}
            {['unpaid'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.customer || []}
                  limitTags={1}
                  value={filter?.customer}
                  key={'filter-customer'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, customer: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="customer" />}
                />
              </Grid>
            )}
            {['unpaid'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.inventoryCategory || []}
                  limitTags={1}
                  value={filter?.inventoryCategory}
                  key={'filter-inventory-category'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, inventoryCategory: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="inventory-category" />}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item xs={12} sm={12} md={2}>
          <Grid container spacing={1}>
            <Grid item sm={12} md={6}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth={true}
                startIcon={<UndoOutlined />}
                onClick={() => {
                  setFilter(() => ({
                    orderValue: '',
                    orderColumn: '',
                    goToPage: 1,
                    rowPerPage: 5,
                    date: '',
                    search: '',
                    location: [],
                    status: [],
                    payment: [],
                    staff: []
                  }));
                  setIsReset(true);
                }}
              >
                <FormattedMessage id="reset" />
              </Button>
            </Grid>
            <Grid item sm={12} md={6}>
              <Button variant="outlined" startIcon={<AlignCenterOutlined />} fullWidth>
                <FormattedMessage id="filter" />
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
