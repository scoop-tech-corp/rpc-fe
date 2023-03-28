import { FormattedMessage } from 'react-intl';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const DetailTransferProduct = (props) => {
  const onCancel = () => {
    props.onClose(true);
  };

  return (
    <>
      <ModalC
        title={<FormattedMessage id="detail-transfer-product" />}
        open={props.open}
        onCancel={onCancel}
        isModalAction={false}
        fullWidth
        maxWidth="md"
      ></ModalC>
    </>
  );
};

DetailTransferProduct.propTypes = {
  open: PropTypes.bool,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onClose: PropTypes.func
};

export default DetailTransferProduct;
