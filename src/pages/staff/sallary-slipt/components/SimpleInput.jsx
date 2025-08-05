import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

// Helper to get nested value from object
const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => acc?.[key] ?? '', obj);
};

// Helper to set nested value into object immutably
const setNestedValue = (obj, path, value) => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;

  return {
    ...obj,
    [head]: setNestedValue(obj?.[head] || {}, rest, value)
  };
};

function SimpleInput({ formValues, setFormValues, id, name, idMessage, accessor, type = 'number', readOnly = false }) {
  const path = accessor.split('.');

  return (
    <Grid item xs={12}>
      <Stack spacing={1}>
        <InputLabel htmlFor={id}>
          <FormattedMessage id={idMessage} />
        </InputLabel>
        <TextField
          required
          InputProps={{
            readOnly
          }}
          type={type}
          fullWidth
          id={id}
          name={name}
          value={getNestedValue(formValues, path)}
          onChange={(event) => {
            setFormValues(setNestedValue(formValues, path, event.target.value));
          }}
        />
      </Stack>
    </Grid>
  );
}

SimpleInput.propTypes = {
  formValues: PropTypes.object.isRequired,
  setFormValues: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  idMessage: PropTypes.string.isRequired,
  accessor: PropTypes.string.isRequired,
  type: PropTypes.string,
  readOnly: PropTypes.bool
};

export default SimpleInput;
