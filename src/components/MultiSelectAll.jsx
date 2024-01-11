import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import debounce from 'lodash/debounce';

import { Autocomplete, TextField } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';

const MultiSelectAll = ({ items, isDetail, selectAllLabel, onChange, value, label, limitTags, style }) => {
  const [selectedOptions, setSelectedOptions] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(null);
  const multiSelectRef = useRef(null);

  useEffect(() => {
    onChange ? onChange(selectedOptions) : '';
  }, [selectedOptions]);

  const handleToggleOption = (selectedOptions) => setSelectedOptions(selectedOptions);
  const handleClearOptions = () => setSelectedOptions([]);
  const getOptionLabel = (option) => `${option.label}`;

  const allItemsSelected = () => {
    if (filteredOptions?.length !== items?.length) {
      const excludedFilteredOptions = filteredOptions?.filter((opt) => !selectedOptions.find((selOpt) => selOpt.label === opt.label));
      if (excludedFilteredOptions?.length > 0) {
        return false;
      }
      return true;
    }
    const allSelected = items?.length > 0 && items?.length === selectedOptions?.length;
    return allSelected;
  };

  const clearSelected = (selOptions) => {
    if (selOptions?.length > 0) {
      setSelectedOptions(selectedOptions.filter((item) => !selOptions.find((selOption) => selOption.label === item.label)));
    } else {
      setSelectedOptions([]);
    }
  };

  const handleSelectAll = (isSelected) => {
    let selectedList = [];
    if (filteredOptions?.length > 0 && filteredOptions?.length !== items?.length) {
      selectedList = items.filter((item) => filteredOptions.find((filteredOption) => filteredOption.label === item.label));
    }
    if (isSelected) {
      if (selectedList?.length > 0) {
        setSelectedOptions([...selectedOptions, ...selectedList]);
      } else {
        setSelectedOptions(items);
      }
    } else {
      clearSelected(selectedList);
    }
  };

  const handleToggleSelectAll = () => {
    console.log('click select all');
    handleSelectAll(!allItemsSelected());
  };

  const handleChange = (event, selectedOptions, reason) => {
    let result = null;
    if (reason === 'clear') {
      handleClearOptions();
    } else if (reason === 'selectOption' || reason === 'removeOption') {
      if (selectedOptions.find((option) => option.value === 'select-all')) {
        handleToggleSelectAll();
        result = items.filter((el) => el.value !== 'select-all');
        setSelectedOptions(result); // Set selectedOptions here
      } else {
        handleToggleOption(selectedOptions);
        result = selectedOptions;
        setSelectedOptions(selectedOptions); // Set selectedOptions here
      }
    }
  };

  const debouncedStateValue = debounce((newVal) => {
    if (newVal && !isEqual(newVal, filteredOptions)) {
      setFilteredOptions(newVal);
    }
  }, 1000);

  const updateFilteredOptions = (filtered) => {
    debouncedStateValue(filtered);
  };

  const inputRenderer = (params) => <TextField {...params} variant="outlined" label={label} />;

  const filter = createFilterOptions();

  if (isDetail) {
    return selectedOptions?.length > 0 ? selectedOptions.map((item) => item.label).join(', ') : '';
  }
  console.log(items);
  return (
    <Autocomplete
      ref={multiSelectRef}
      multiple
      sx={style}
      options={items}
      value={selectedOptions}
      limitTags={limitTags || 2}
      disableCloseOnSelect
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={(option, val) => option.value === val.value}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);
        updateFilteredOptions(filtered);
        return [{ label: selectAllLabel, value: 'select-all' }, ...filtered];
      }}
      onChange={handleChange}
      renderInput={inputRenderer}
    />
  );
};

export default MultiSelectAll;
