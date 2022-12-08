import { TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useLocationDetailStore } from '../location-detail-store';
import MainCard from 'components/MainCard';

const TabDescription = () => {
  const description = useLocationDetailStore((state) => state.description);

  return (
    <MainCard title={<FormattedMessage id="overview" />}>
      <TextField
        multiline
        fullWidth
        id="description"
        name="description"
        value={description}
        rows={5}
        onChange={(event) => useLocationDetailStore.setState({ description: event.target.value })}
      />
    </MainCard>
  );
};

export default TabDescription;
