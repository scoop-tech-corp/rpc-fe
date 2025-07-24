import React from 'react';
import PropTypes from 'prop-types';
import { Grid, InputLabel, Stack, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';

// Helper: get nested value
const getNestedValue = (obj, path) => {
  return path.reduce((acc, key) => acc?.[key] ?? '', obj);
};

// Helper: set nested value immutably
const setNestedValue = (obj, path, value) => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  return {
    ...obj,
    [head]: setNestedValue(obj?.[head] || {}, rest, value)
  };
};

function GroupInput({ formValues, setFormValues, id, groupTitleIdMessage, accessor, readOnly }) {
  const path = accessor.split('.');

  const handleChange = (field) => (e) => {
    const fullPath = [...path, field];
    const value = e.target.value;

    setFormValues(setNestedValue(formValues, fullPath, value));
  };

  const getValue = (field) => {
    return getNestedValue(formValues, [...path, field]);
  };

  return (
    <Grid item xs={12}>
      <Stack spacing={1}>
        <InputLabel style={{ fontWeight: 'bold' }}>
          <FormattedMessage id={groupTitleIdMessage} />
        </InputLabel>

        <Stack direction="row" spacing={1}>
          {/* amount */}
          <Stack spacing={1} width={'100%'}>
            <InputLabel htmlFor={`${id}Amount`}>
              <FormattedMessage id="amount" />
            </InputLabel>
            <TextField
              InputProps={{
                readOnly
              }}
              type="number"
              fullWidth
              id={`${id}Amount`}
              name="amount"
              value={getValue('amount')}
              onChange={handleChange('amount')}
            />
          </Stack>

          {/* unitNominal */}
          <Stack spacing={1} width={'100%'}>
            <InputLabel htmlFor={`${id}UnitNominal`}>
              <FormattedMessage id="unit-nominal" />
            </InputLabel>
            <TextField
              InputProps={{
                readOnly
              }}
              type="number"
              fullWidth
              id={`${id}UnitNominal`}
              name="unitNominal"
              value={getValue('unitNominal')}
              onChange={handleChange('unitNominal')}
            />
          </Stack>

          {/* total (read-only) */}
          <Stack spacing={1} width={'100%'}>
            <InputLabel htmlFor={`${id}Total`}>
              <FormattedMessage id="total" />
            </InputLabel>
            <TextField type="text" fullWidth id={`${id}Total`} name="total" value={getValue('total')} InputProps={{ readOnly: true }} />
          </Stack>
        </Stack>
      </Stack>
    </Grid>
  );
}

GroupInput.propTypes = {
  formValues: PropTypes.object.isRequired,
  setFormValues: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
  accessor: PropTypes.string.isRequired, // e.g., "expense.absent"
  groupTitleIdMessage: PropTypes.string.isRequired,
  readOnly: PropTypes.bool
};

export default GroupInput;
