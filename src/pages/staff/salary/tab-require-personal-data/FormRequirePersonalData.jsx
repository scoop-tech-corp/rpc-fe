import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { Autocomplete, Grid, InputLabel, Stack, TextField } from '@mui/material';
import { createMessageBackend } from 'service/service-global';
import { createRequirePersonalData, getDetailRequirePersonalData, updateRequirePersonalData } from '../service';
import { getDropdownStaffDataStatic } from 'pages/staff/static-data/service';

import PropTypes from 'prop-types';
import ModalC from 'components/ModalC';

const FormRequirePersonalData = (props) => {
  const { id } = props;
  const [formValue, setFormValue] = useState({ jobId: null, types: [] });
  const [typeIdList, setTypeIdList] = useState([]);
  const [jobList, setJobList] = useState([]);

  const dispatch = useDispatch();

  const onSubmit = async () => {
    const jobId = formValue.jobId.value || null;
    const types = formValue.types.map((dt) => dt.value);

    const catchErrorResponse = (err) => {
      if (err) dispatch(snackbarError(createMessageBackend(err)));
    };

    if (id) {
      // update
      await updateRequirePersonalData({ id, jobId, types })
        .then((resp) => {
          if (resp && resp.status === 200) {
            dispatch(snackbarSuccess(`Data has been updated successfully`));
            props.onClose(true);
          }
        })
        .catch(catchErrorResponse);
    } else {
      // create
      await createRequirePersonalData({ jobId: jobId, types: types })
        .then((resp) => {
          if (resp && resp.status === 200) {
            dispatch(snackbarSuccess(`Data has been created successfully`));
            props.onClose(true);
          }
        })
        .catch(catchErrorResponse);
    }
  };

  const onCancel = () => props.onClose();

  const onDropdownHandler = (selected, procedure) => {
    setFormValue((prevState) => {
      return { ...prevState, [procedure]: selected || null };
    });
  };

  const fetchData = async () => {
    const { dataStaticTypeId, dataStaticJobTitle } = await getDropdownStaffDataStatic();
    setJobList(dataStaticJobTitle);
    setTypeIdList(dataStaticTypeId);

    if (id) {
      // hit get detail by id
      const resp = await getDetailRequirePersonalData(id);
      const getData = resp.data;
      const job = dataStaticJobTitle.find((datum) => +datum.value === +getData.jobId);
      const types = [];
      ([...getData.detail] || []).forEach((dt) => {
        const find = dataStaticTypeId.find((datum) => +datum.value === +dt.id);
        if (find) types.push(find);
      });
      setFormValue({ jobId: job, types });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalC
      title={<FormattedMessage id="create-require-personal-data" />}
      okText="Save"
      cancelText="Cancel"
      open={props.open}
      onOk={onSubmit}
      onCancel={onCancel}
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="role">{<FormattedMessage id="role" />}</InputLabel>
            <Autocomplete
              id="role"
              options={jobList}
              value={formValue.jobId}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onDropdownHandler(value, 'jobId')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // error={Boolean(dt.error.petCategoryErr && dt.error.petCategoryErr.length > 0)}
                  // helperText={dt.error.petCategoryErr}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12}>
          <Stack spacing={1}>
            <InputLabel htmlFor="type-of-id">{<FormattedMessage id="type-of-id" />}</InputLabel>
            <Autocomplete
              id="type-of-id"
              multiple
              options={typeIdList}
              value={formValue.types}
              isOptionEqualToValue={(option, val) => val === '' || option.value === val.value}
              onChange={(_, value) => onDropdownHandler(value, 'types')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  // error={Boolean(dt.error.petCategoryErr && dt.error.petCategoryErr.length > 0)}
                  // helperText={dt.error.petCategoryErr}
                  variant="outlined"
                />
              )}
            />
          </Stack>
        </Grid>
      </Grid>
    </ModalC>
  );
};

FormRequirePersonalData.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func
};

export default FormRequirePersonalData;
