import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useServiceFormStore } from '../service-form-store';
import useGetList from 'hooks/useGetList';
import { getFacilityList } from '../../service';

const TabFacility = () => {
  const categoriesStore = useServiceFormStore((state) => state.categories);
  const location = useServiceFormStore((state) => state.location);
  const facility = useServiceFormStore((state) => state.facility);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  const listFacility = useGetList(getFacilityList, {
    locationId: '[' + location.map((item) => item.value).join(',') + ']',
    disabled: location.length === 0
  });

  const [categories, setCategories] = useState([]);

  const onSelectedFacility = (_, val) => {
    setCategories(val);
    useServiceFormStore.setState({ facility: val });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={12}>
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="facility" />
          </InputLabel>
          <Autocomplete
            id="facility"
            multiple
            readOnly={isDetail}
            // limitTags={3}
            options={listFacility?.list?.map((item) => ({ value: item.id, label: item.unitName })) || []}
            value={facility}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={onSelectedFacility}
            renderInput={(params) => <TextField {...params} variant="outlined" />}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TabFacility;
