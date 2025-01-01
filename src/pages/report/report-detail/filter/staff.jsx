import { Button, Grid } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

export default function FilterStaff({ extData, filter, setFilter }) {
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
            {detail === 'leave' && (
              <Grid item sm={12} xs={12} md={4}>
                <MultiSelectAll
                  items={extData?.leaveType || []}
                  limitTags={1}
                  value={filter?.leaveType}
                  key={'filter-leave-type'}
                  selectAllLabel="Select All"
                  onChange={(val) => setFilter((e) => ({ ...e, leaveType: val }))}
                  isReset={isReset}
                  setIsReset={setIsReset}
                  label={<FormattedMessage id="leave-type" />}
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
                  setFilter(() => ({ orderValue: '', orderColumn: '', date: '', location: [] }));
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
