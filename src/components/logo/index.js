import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project import
// import LogoMain from './LogoMain';
// import LogoIcon from './LogoIcon';
import LogoMainRpc from './LogoMainRpc';
import LogoIconRpc from './LogoIconRpc';
import config from 'config';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = ({ isIcon, reverse, sx, to }) => (
  <ButtonBase disableRipple component={Link} to={!to ? config.defaultPath : to} sx={sx}>
    {isIcon ? <LogoIconRpc /> : <LogoMainRpc reverse={reverse} />}
  </ButtonBase>
);

LogoSection.propTypes = {
  reverse: PropTypes.bool,
  isIcon: PropTypes.bool,
  location: PropTypes.string,
  sx: PropTypes.object,
  to: PropTypes.string
};

export default LogoSection;
