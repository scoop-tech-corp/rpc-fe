import { TextField } from '@mui/material';
import PropTypes from 'prop-types';

const InputDecimal = (props) => {
  const onChangeHandler = (e) => {
    let start = e.target.selectionStart;
    let val = e.target.value;
    val = val.replace(/([^0-9.]+)/, '');
    val = val.replace(/^(0|\.)/, '');

    const match = /(\d{0,7})[^.]*((?:\.\d{0,2})?)/g.exec(val);
    const value = match[1] + match[2];

    e.target.value = value;
    if (props.setValueState) props.setValueState(value);
    props.onChangeOutput(value);

    if (val.length > 0) {
      e.target.value = Number(value).toFixed(2);
      e.target.setSelectionRange(start, start);
      if (props.setValueState) props.setValueState(Number(value).toFixed(2));
      props.onChangeOutput(Number(value).toFixed(2));
    }
  };

  return <TextField fullWidth type="text" id={props.id} name={props.name} value={props.valueState} onChange={onChangeHandler} />;
};

InputDecimal.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  valueState: PropTypes.any,
  setValueState: PropTypes.any,
  onChangeOutput: PropTypes.func
};

export default InputDecimal;
