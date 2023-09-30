import { Checkbox, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';

const TabDescription = () => {
  const policy = useServiceFormStore((state) => state.policy);
  const optionPolicy1 = useServiceFormStore((state) => state.optionPolicy1);
  const optionPolicy2 = useServiceFormStore((state) => state.optionPolicy2);
  const optionPolicy3 = useServiceFormStore((state) => state.optionPolicy3);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  return (
    <MainCard title={<FormattedMessage id="overview" />}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="policy">Policy</InputLabel>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              {isDetail ? (
                <div style={{ marginTop: 5 }}>
                  {policy == 0 ? 'Surat Persetujuan Penitipan' : 'Surat Persetujuan Tindakan / Rawat Inap / Operasi'}
                </div>
              ) : (
                <Select
                  id="policy"
                  name="policy"
                  value={policy}
                  onChange={(event) => useServiceFormStore.setState({ policy: event.target.value })}
                  placeholder="Select policy"
                >
                  <MenuItem value={1}>Surat Persetujuan Tindakan / Rawat Inap / Operasi</MenuItem>
                  <MenuItem value={0}>Surat Persetujuan Penitipan</MenuItem>
                </Select>
              )}
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={optionPolicy1}
                    disabled={isDetail}
                    onChange={(e) => {
                      useServiceFormStore.setState({ optionPolicy1: e.target.checked });
                    }}
                  />
                }
                label="Dapat dipesan online"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={optionPolicy2}
                    disabled={isDetail}
                    onChange={(e) => {
                      useServiceFormStore.setState({ optionPolicy2: e.target.checked });
                    }}
                  />
                }
                label="Rekam medis alasan kunjungan"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={optionPolicy3}
                    disabled={isDetail}
                    onChange={(e) => {
                      useServiceFormStore.setState({ optionPolicy3: e.target.checked });
                    }}
                  />
                }
                label="Rekam diagnosa"
              />
            </FormControl>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
};

export default TabDescription;
