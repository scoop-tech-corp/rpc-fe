import { useMemo } from 'react';

// material-ui
import { Box, useMediaQuery } from '@mui/material';

// project import
import useConfig from 'hooks/useConfig';
import Search from './Search';
import Profile from './Profile';
import Localization from './Localization';
import MobileSection from './MobileSection';

// import Message from './Message';
// import Notification from './Notification';
// import MegaMenuSection from './MegaMenuSection';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n } = useConfig();

  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localization = useMemo(() => <Localization />, [i18n]);

  // const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <>
      {!matchesXs && <Search />}
      {/* {!matchesXs && megaMenu} */}
      {!matchesXs && localization}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}

      {/* <Notification /> */}
      {/* <Message /> */}
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
