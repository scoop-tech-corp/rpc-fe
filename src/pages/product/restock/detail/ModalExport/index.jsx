import { useEffect, useState } from 'react';
import { Autocomplete, FormControlLabel, InputLabel, Radio, RadioGroup, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { getSupplierProductRestock } from '../../service';

import ModalC from 'components/ModalC';
import PropTypes from 'prop-types';

const ModalExport = (props) => {
  const [exportType, setExportType] = useState(''); // allSupplier || selectedSupplier
  const [selectedSupplier, setSelectedSupplier] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const resetField = () => {
    setExportType('');
    setSelectedSupplier([]);
    setSupplierList([]);
  };

  const handleOnCancel = () => {
    props.onClose(true);
    resetField();
  };

  const handleOnOke = () => {
    props.onExport({ exportType, selectedSupplier });
    resetField();
  };

  const getSupplierList = async () => {
    const getResp = await getSupplierProductRestock(props.id);
    setSupplierList(getResp);
  };

  const isDisabled = () => {
    return !exportType || (exportType === 'selectedSupplier' && !selectedSupplier.length);
  };

  useEffect(() => {
    getSupplierList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="please-select-which-data-do-you-want-to-export" />}
      okText="Export"
      cancelText="Cancel"
      open={props.isOpen}
      onOk={handleOnOke}
      onCancel={handleOnCancel}
      disabledOk={isDisabled()}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <RadioGroup
        name="exportType"
        value={exportType}
        style={{ flexDirection: 'row', height: '20px', margin: '10px 0px' }}
        onChange={(e) => {
          setExportType(e.target.value);
          setSelectedSupplier([]);
        }}
      >
        <FormControlLabel
          value="allSupplier"
          control={<Radio />}
          label={<FormattedMessage id="all-supplier" />}
          style={{ height: '20px' }}
        />
        <FormControlLabel
          value="selectedSupplier"
          control={<Radio />}
          label={<FormattedMessage id="only-selected-supplier" />}
          style={{ height: '20px' }}
        />
      </RadioGroup>
      {exportType === 'selectedSupplier' && (
        <Stack spacing={1}>
          <InputLabel>
            <FormattedMessage id="supplier" />
          </InputLabel>
          <Autocomplete
            id="supplier"
            multiple
            options={supplierList}
            value={selectedSupplier}
            isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
            onChange={(_, value) => setSelectedSupplier(value)}
            renderInput={(params) => <TextField {...params} />}
          />
        </Stack>
      )}
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
