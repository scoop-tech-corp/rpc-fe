import { AlignCenterOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Grid, MenuItem, Select, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSearchParams } from 'react-router-dom';

import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import MultiSelectAll from 'components/MultiSelectAll';

const CLINIC_STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'Menunggu Dokter', label: 'Menunggu Dokter' },
  { value: 'Cek Kondisi Pet', label: 'Cek Kondisi Pet' },
  { value: 'Dalam Perawatan', label: 'Dalam Perawatan' },
  { value: 'Proses Pembayaran', label: 'Proses Pembayaran' },
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Batal', label: 'Batal' }
];

export default function FilterBooking({ extData, filter, setFilter }) {
  const [isReset, setIsReset] = useState(false);
  let [searchParams] = useSearchParams();
  let detail = searchParams.get('detail');

  const isDiagnosisList = detail === 'diagnosis-list';

  const handleReset = () => {
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
      species: [],
      search: '',
      status: ''
    }));
    setIsReset(true);
  };

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

            {/* Customer search — diagnosis list only */}
            {isDiagnosisList && (
              <Grid item sm={12} xs={12} md={4}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Cari customer..."
                  value={filter?.search || ''}
                  onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value, goToPage: 1 }))}
                  label={<FormattedMessage id="customer" />}
                />
              </Grid>
            )}

            {/* Status — diagnosis list only */}
            {isDiagnosisList && (
              <Grid item sm={12} xs={12} md={4}>
                <Select
                  size="small"
                  fullWidth
                  displayEmpty
                  value={filter?.status || ''}
                  onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value, goToPage: 1 }))}
                >
                  {CLINIC_STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

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

        <Grid item sm={12} xs={12} md={2}>
          <Grid container spacing={1}>
            <Grid item sm={12} md={6}>
              <Button variant="outlined" color="secondary" fullWidth={true} startIcon={<UndoOutlined />} onClick={handleReset}>
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
