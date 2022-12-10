import MainCard from 'components/MainCard';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

const ErrorContainer = ({ open, content }) => {
  return open ? (
    <MainCard border={true} sx={{ mb: 1 }} style={{ background: 'rgb(240, 65, 52)', color: '#ffffff' }} boxShadow>
      <Typography variant="h5" fontWeight={700}>
        Error
      </Typography>

      <Typography variant="h6" fontWeight={700}>
        {content.title}
      </Typography>
      <ul dangerouslySetInnerHTML={{ __html: content.detail }}></ul>
    </MainCard>
  ) : (
    <></>
  );
};

ErrorContainer.propTypes = {
  open: PropTypes.bool,
  content: PropTypes.object
};

export default ErrorContainer;
