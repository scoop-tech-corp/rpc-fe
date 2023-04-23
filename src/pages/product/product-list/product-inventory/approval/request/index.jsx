import { useState } from 'react';

import PropTypes from 'prop-types';
import ListRequest from './list-request';
import ProductInventoryApprovalDetail from './detail';

const RequestProduct = (props) => {
  const [dialog, setDialog] = useState({ view: false, data: { id: '', status: '' } });

  const onClickDetail = async (rowData) => {
    setDialog((prev) => ({ ...prev, view: true, data: { id: +rowData.id, status: '' } }));
  };

  return (
    <>
      <ListRequest filterLocationList={props.filterLocationList} onClickDetail={onClickDetail} />
      {dialog.view && (
        <ProductInventoryApprovalDetail
          open={dialog.view}
          id={dialog.data.id}
          parentProcedure="list-request"
          onClose={(e) => setDialog((prevState) => ({ ...prevState, view: !e }))}
        />
      )}
    </>
  );
};

RequestProduct.propTypes = {
  filterLocationList: PropTypes.arrayOf(PropTypes.any)
};

export default RequestProduct;
