import { forwardRef } from 'react';
import NumericFormat from 'react-number-format';
import PropTypes from 'prop-types';

const NumberFormatCustom = forwardRef(function NumberFormatCustom(props, ref) {
  const { ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      // onValueChange={(values, sourceInfo) => {
      //   console.log(values, sourceInfo);
      // }}
      thousandSeparator
      isNumericString
    />
  );
});

NumberFormatCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func
};

export default NumberFormatCustom;
