import { useState } from 'react';
import { Button, FormControl, MenuItem, Select, InputLabel, Grid, TextField } from '@mui/material'; // useMediaQuery
import { FormattedMessage } from 'react-intl';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

export default function FilterCustomer({ extData, filter, setFilter }) {
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
            {['list', 'referral-spend', 'sub-account-list'].includes(detail) && (
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
            {!['referral-spend'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.customerGroup || []}
                  limitTags={1}
                  value={filter?.customerGroup}
                  key={'filter-customer-group'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, customerGroup: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="customer-group" />}
                />
              </Grid>
            )}
            {['leaving', 'list'].includes(detail) && (
              <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    id="status"
                    name="status"
                    value={filter?.status}
                    onChange={(event) => setFilter((e) => ({ ...e, status: event.target.value }))}
                    placeholder="Select status"
                  >
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select-status" />
                      </em>
                    </MenuItem>
                    <MenuItem value={'1'}>
                      <FormattedMessage id="active" />
                    </MenuItem>
                    <MenuItem value={'0'}>
                      <FormattedMessage id="inactive" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            {['list', 'sub-account-list'].includes(detail) && (
              <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    <FormattedMessage id="gender" />
                  </InputLabel>
                  <Select
                    id="gender"
                    name="gender"
                    value={filter?.gender}
                    onChange={(event) => setFilter((e) => ({ ...e, gender: event.target.value }))}
                    placeholder="Select gender"
                  >
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select-gender" />
                      </em>
                    </MenuItem>
                    <MenuItem value={'P'}>{<FormattedMessage id="male" />}</MenuItem>
                    <MenuItem value={'W'}>{<FormattedMessage id="female" />}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {['sub-account-list'].includes(detail) && (
              <Grid item xs={12} sm={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>
                    <FormattedMessage id="sterile" />
                  </InputLabel>
                  <Select
                    id="filter-sterile"
                    name="filter-sterile"
                    value={filter?.sterile}
                    onChange={(event) => setFilter((e) => ({ ...e, sterile: event.target.value }))}
                  >
                    <MenuItem value="">
                      <em>
                        <FormattedMessage id="select" />
                      </em>
                    </MenuItem>
                    <MenuItem value={'1'}>
                      <FormattedMessage id="yes" />
                    </MenuItem>
                    <MenuItem value={'0'}>
                      <FormattedMessage id="no" />
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {['list'].includes(detail) && (
              <Grid item xs={12} sm={12} md={4}>
                <MultiSelectAll
                  items={extData?.typeId || []}
                  limitTags={1}
                  value={filter?.typeId}
                  key={'filter-typeId'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, customerGroup: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="id-type" />}
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
                  setFilter(() => ({ location: [], customerGroup: [], date: '', status: '', search: '', gender: '', typeId: null }));
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
