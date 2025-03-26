import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

export default function FilterExpenses({ extData, filter, setFilter }) {
  const [isReset, setIsReset] = useState(false);
  let [searchParams] = useSearchParams();
  let detail = searchParams.get('detail');

  return (
    <>
      <Grid container spacing={2} width={'100%'}>
        <Grid item sm={12} xs={12} md={9}>
          <Grid container spacing={2}>
            {/* Date */}
            <Grid item sm={12} xs={12} md={4}>
              <DateRangePicker
                onChange={(value) => setFilter((e) => ({ ...e, date: value }))}
                value={filter.date}
                format="dd/MM/yyy"
                className={'fullWidth'}
              />
            </Grid>

            {/* Location */}
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

            {/* Payment */}
            {['list'].includes(detail) && (
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
            )}

            {/* Status */}
            {['list'].includes(detail) && (
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
            )}

            {/* Submiter */}
            {['list'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.submiter || []}
                  limitTags={1}
                  value={filter?.submiter}
                  key={'filter-submiter'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, submiter: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="submiter" />}
                />
              </Grid>
            )}

            {/* Supplier */}
            {['list'].includes(detail) && (
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
            )}

            {/* Recipient */}
            {['list'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.recipient || []}
                  limitTags={1}
                  value={filter?.recipient}
                  key={'filter-recipient'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, recipient: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="recipient" />}
                />
              </Grid>
            )}

            {/* Category */}
            {['list'].includes(detail) && (
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

            {/* Search */}
            {['list'].includes(detail) && (
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
                    payment: [],
                    status: [],
                    submiter: [],
                    supplier: [],
                    recipient: [],
                    category: []
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
