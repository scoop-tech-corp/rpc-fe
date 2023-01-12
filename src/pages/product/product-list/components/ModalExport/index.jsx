import { useState } from 'react';
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';
import { FormattedMessage } from 'react-intl';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const ModalExport = (props) => {
  const [allData, setAllData] = useState(false);
  const [onlyItem, setOnlyItem] = useState(false);

  const resetCheckbox = () => {
    setAllData(false);
    setOnlyItem(false);
  };

  const handleOnCancel = () => {
    props.onClose(true);
    resetCheckbox();
  };

  const handleOnOke = () => {
    props.onExport({ allData, onlyItem });
    resetCheckbox();
  };

  return (
    <ModalC
      title={<FormattedMessage id="please-select-which-data-do-you-want-to-export" />}
      okText="Export"
      cancelText="Cancel"
      open={props.isModalExport}
      onOk={handleOnOke}
      onCancel={handleOnCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={allData} onChange={(e) => setAllData(e.target.checked)} name="allData" />}
          label={<FormattedMessage id="all-data" />}
        />
        <FormControlLabel
          control={<Checkbox checked={onlyItem} onChange={(e) => setOnlyItem(e.target.checked)} name="onlyItem" />}
          label={<FormattedMessage id="only-items-that-already-reach-stock-limit" />}
        />
      </FormGroup>
    </ModalC>
  );
};

ModalExport.propTypes = {
  isModalExport: PropTypes.bool,
  onExport: PropTypes.func,
  onClose: PropTypes.func
};

export default ModalExport;
