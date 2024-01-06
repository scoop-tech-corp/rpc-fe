import { useMemo, useState } from 'react';

// material-ui
import { Box, useMediaQuery } from '@mui/material';

// project import
import useConfig from 'hooks/useConfig';
import Search from './Search';
import Profile from './Profile';
import Localization from './Localization';
import MobileSection from './MobileSection';
import QuickMenu from './quick-menu';

import ProductInventoryApproval from 'pages/product/product-list/product-inventory/approval';
import ProductTransferApproval from 'pages/product/transfer-approval';
import ProductRestockQuickAccessApproval from 'pages/product/restock/approval/quick-access';

// import Message from './Message';
// import Notification from './Notification';
// import MegaMenuSection from './MegaMenuSection';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n } = useConfig();

  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localization = useMemo(() => <Localization />, [i18n]);
  const [openModalInvenApproval, setOpenModalInvenApproval] = useState(false);
  const [openModalRestockApproval, setOpenModalRestockApproval] = useState(false);
  const [openModalTransferApproval, setOpenModalTransferApproval] = useState(false);

  // const megaMenu = useMemo(() => <MegaMenuSection />, []);

  const responseQuckMenu = (event) => {
    if (event.menuType === 'IA') setOpenModalInvenApproval(event.isOpen);
    if (event.menuType === 'RA') setOpenModalRestockApproval(event.isOpen);
    if (event.menuType === 'TA') setOpenModalTransferApproval(event.isOpen);
  };

  return (
    <>
      <QuickMenu onQuickMenuOpen={responseQuckMenu} />
      {!matchesXs && <Search />}
      {/* {!matchesXs && megaMenu} */}
      {!matchesXs && localization}
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}
      {/* <Notification /> */}
      {/* <Message /> */}
      {!matchesXs && <Profile />}
      {matchesXs && <MobileSection />}

      {openModalInvenApproval && <ProductInventoryApproval open={openModalInvenApproval} onClose={(e) => setOpenModalInvenApproval(!e)} />}
      {openModalRestockApproval && (
        <ProductRestockQuickAccessApproval open={openModalRestockApproval} onClose={(e) => setOpenModalRestockApproval(!e)} />
      )}
      {openModalTransferApproval && (
        <ProductTransferApproval open={openModalTransferApproval} onClose={(e) => setOpenModalTransferApproval(!e)} />
      )}
    </>
  );
};

export default HeaderContent;
