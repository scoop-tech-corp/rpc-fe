import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import MultiSelectAll from 'components/MultiSelectAll';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';

export default function FilterProducts({ extData, filter, setFilter }) {
  const [isReset, setIsReset] = useState(false);
  let [searchParams] = useSearchParams();
  let detail = searchParams.get('detail');

  return (
    <>
      <Grid container spacing={2} width={'100%'}>
        <Grid item sm={12} xs={12} md={9}>
          <Grid container spacing={2}>
            {['cost', 'reminders'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <DateRangePicker
                  onChange={(value) => setFilter((e) => ({ ...e, date: value }))}
                  value={filter.date}
                  format="dd/MM/yyy"
                  className={'fullWidth'}
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

            {['stock-count', 'low-stock', 'no-stock', 'cost', 'reminders'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <TextField
                  fullWidth
                  label={['cost', 'reminders'].includes(detail) ? <FormattedMessage id="product" /> : <FormattedMessage id="search" />}
                  id="filter-search"
                  name="filter-search"
                  value={filter.search}
                  onChange={(event) => setFilter((e) => ({ ...e, search: event.target.value }))}
                />
              </Grid>
            )}

            {['stock-count', 'low-stock', 'no-stock'].includes(detail) && (
              <>
                <Grid item sm={12} xs={12} md={4}>
                  <MultiSelectAll
                    items={extData?.brand || []}
                    limitTags={1}
                    value={filter?.brand}
                    key={'filter-brand'}
                    selectAllLabel="Select All"
                    onChange={(val) => setFilter((e) => ({ ...e, brand: val }))}
                    isReset={isReset}
                    setIsReset={setIsReset}
                    label={<FormattedMessage id="brand" />}
                  />
                </Grid>
                <Grid item sm={12} xs={12} md={4}>
                  <MultiSelectAll
                    items={extData?.supplier || []}
                    limitTags={1}
                    value={filter?.supplier}
                    key={'filter-supplier'}
                    selectAllLabel="Select All"
                    onChange={(val) => setFilter((e) => ({ ...e, supplier: val }))}
                    isReset={isReset}
                    setIsReset={setIsReset}
                    label={<FormattedMessage id="supplier" />}
                  />
                </Grid>
              </>
            )}

            {/* create filter customer for reminders detail */}
            {['reminders'].includes(detail) && (
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
                    search: '',
                    brand: [],
                    supplier: [],
                    location: [],
                    customer: []
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
