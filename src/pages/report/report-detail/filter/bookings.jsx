import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Grid } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

export default function FilterBooking({ extData, filter, setFilter }) {
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

            {/* Gender */}
            {['by-diagnosis-species-gender'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.gender || []}
                  limitTags={1}
                  value={filter?.gender}
                  key={'filter-gender'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, gender: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="gender" />}
                />
              </Grid>
            )}

            {/* Diagnose */}
            {['by-diagnosis-species-gender'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.diagnose || []}
                  limitTags={1}
                  value={filter?.diagnose}
                  key={'filter-diagnose'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, diagnose: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="diagnose" />}
                />
              </Grid>
            )}

            {/* Species */}
            {['by-diagnosis-species-gender'].includes(detail) && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.species || []}
                  limitTags={1}
                  value={filter?.species}
                  key={'filter-species'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, species: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="species" />}
                />
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item sm={12} xs={12} md={9}>
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
                    location: [],
                    staff: [],
                    service: [],
                    category: [],
                    facility: [],
                    gender: [],
                    diagnose: [],
                    species: []
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
