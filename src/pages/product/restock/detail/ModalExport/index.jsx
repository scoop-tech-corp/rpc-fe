import { useEffect, useState } from 'react';
import { Autocomplete, Checkbox, FormControlLabel, FormGroup, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getSupplierProductRestock } from '../../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const ModalExport = (props) => {
  const [allSupplier, setAllSupplier] = useState(false);
  const [onlySelectedSupplier, setOnlySelectedSupplier] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const resetField = () => {
    setAllSupplier(false);
    setOnlySelectedSupplier(false);
    setSelectedSupplier([]);
    setSupplierList([]);
  };

  const handleOnCancel = () => {
    props.onClose(true);
    resetField();
  };

  const handleOnOke = () => {
    props.onExport({ allSupplier, onlySelectedSupplier, selectedSupplier });
    resetField();
  };

  const getSupplierList = async () => {
    const getResp = await getSupplierProductRestock(props.id);
    setSupplierList(getResp);
  };

  useEffect(() => {
    if (onlySelectedSupplier) {
      // hit supplier list
      getSupplierList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlySelectedSupplier]);

  return (
    <ModalC
      title={<FormattedMessage id="please-select-which-data-do-you-want-to-export" />}
      okText="Export"
      cancelText="Cancel"
      open={props.isOpen}
      onOk={handleOnOke}
      onCancel={handleOnCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={allSupplier} onChange={(e) => setAllSupplier(e.target.checked)} name="allSupplier" />}
          label={<FormattedMessage id="all-supplier" />}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={onlySelectedSupplier}
              onChange={(e) => setOnlySelectedSupplier(e.target.checked)}
              name="onlySelectedSupplier"
            />
          }
          label={<FormattedMessage id="only-selected-supplier" />}
        />
        {onlySelectedSupplier && (
          <Autocomplete
            id="supplier"
            multiple
            options={supplierList}
            value={selectedSupplier}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => setSelectedSupplier(value)}
            renderInput={(params) => <TextField {...params} />}
          />
        )}
      </FormGroup>
    </ModalC>
  );
};

ModalExport.propTypes = {
  id: PropTypes.number,
  isOpen: PropTypes.bool,
  onExport: PropTypes.func,
  onClose: PropTypes.func
};

export default ModalExport;
