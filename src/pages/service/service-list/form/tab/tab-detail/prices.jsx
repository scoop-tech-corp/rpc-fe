import { Button, FormControl, IconButton, MenuItem, Select, TextField } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useServiceFormStore } from '../../service-form-store';

import MainCard from 'components/MainCard';
import { ReactTable } from 'components/third-party/ReactTable';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import NumberFormatCustom from 'utils/number-format';
import MultiSelectAll from 'components/MultiSelectAll';

const defaultForm = {
  duration: '',
  unit: '',
  price: '',
  customerGroup: [],
  location: [],
  title: ''
};

const Prices = () => {
  const locations = useServiceFormStore((state) => state.dataSupport.locationList);
  const custGroups = useServiceFormStore((state) => state.dataSupport.customerGroupsList);
  const listPrice = useServiceFormStore((state) => state.listPrice);
  const isDetail = useServiceFormStore((state) => state.isDetail);

  const [form, setForm] = useState(defaultForm);
  const [render, setRender] = useState(0);

  useEffect(() => {
    if (isDetail) {
      if (listPrice) setMergeList([...listPrice]);
    } else {
      if (listPrice) setMergeList([formCreated, ...listPrice]);
      else setMergeList([formCreated]);
    }
  }, [listPrice, form, locations, custGroups, render, listPrice]);

  const onFieldHandler = (event, name) => {
    if (name == 'customerGroup' || name == 'location') {
      setForm((e) => ({ ...e, [name]: event }));
      return;
    }
    setForm((e) => ({ ...e, [event?.target?.name]: event?.target?.value }));
  };

  console.log(form);
  const formCreated = {
    isCreate: true,
    duration: (
      <TextField
        fullWidth
        name="duration"
        type="number"
        InputProps={{ inputProps: { min: 0 } }}
        value={form.duration}
        onChange={onFieldHandler}
      />
    ),
    unit: (
      <FormControl sx={{ width: '100%' }}>
        <Select name="unit" placeholder="Select status" value={form.unit} onChange={onFieldHandler}>
          <MenuItem value="days">Days</MenuItem>
          <MenuItem value="weeks">Weeks</MenuItem>
          <MenuItem value="month">Month</MenuItem>
        </Select>
      </FormControl>
    ),
    price: (
      <TextField
        fullWidth
        name="price"
        value={form.price}
        onChange={onFieldHandler}
        InputProps={{
          startAdornment: 'Rp',
          inputComponent: NumberFormatCustom
        }}
      />
    ),
    customerGroup: (
      <MultiSelectAll
        items={custGroups || []}
        value={form.customerGroup}
        key={form.customerGroup?.length}
        selectAllLabel="Select All"
        onChange={(e) => onFieldHandler(e, 'customerGroup')}
      />
    ),
    location: (
      <MultiSelectAll
        items={locations || []}
        value={form.location}
        name={'location'}
        key={form.location?.length}
        selectAllLabel="Select All"
        onChange={(e) => onFieldHandler(e, 'location')}
      />
    ),
    title: <TextField fullWidth name="title" onChange={onFieldHandler} value={form.title} />
  };
  const [mergeList, setMergeList] = useState([]);
  const handleDeleteList = (id) => {
    useServiceFormStore.setState((state) => ({ ...state, listPrice: state.listPrice.filter((item) => item.id !== id) }));
    setRender((e) => e + 1);
  };
  const onAddedPrice = () => {
    function generateData() {
      form.location?.forEach((location) => {
        form.customerGroup?.forEach((customerGroup) => {
          const newData = {
            id: Date.now() + Math.random() * 100,
            duration: form.duration,
            unit: form.unit,
            price: form.price,
            customerGroup: {
              label: customerGroup.label,
              value: customerGroup.value
            },
            location: {
              label: location.label,
              value: location.value
            },

            title: form.title
          };

          listPrice.push(newData);
        });
      });
    }

    generateData();

    setForm(defaultForm);
  };
  const columns = useMemo(
    () => [
      {
        Header: <FormattedMessage id="duration" />,
        accessor: 'duration',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="units" />,
        accessor: 'unit',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate) return data.row.original.unit;
          return <p>{data.row.original.unit == 'days' ? 'Day' : data.row.original.unit == 'weeks' ? 'Week' : 'Month'}</p>;
        }
      },
      {
        Header: <FormattedMessage id="price" />,
        accessor: 'price',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="customer-group" />,
        accessor: 'customerGroup',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate) {
            return data.row.original.customerGroup;
          }
          return <p>{data?.row?.original?.customerGroup?.label}</p>;
        }
      },
      {
        Header: <FormattedMessage id="location" />,
        accessor: 'location',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate) {
            return data.row.original.location;
          }
          return <p>{data.row?.original?.location?.label}</p>;
        }
      },
      { Header: <FormattedMessage id="title" />, accessor: 'title', isNotSorting: true },
      {
        Header: '',
        accessor: 'action',
        isNotSorting: true,
        Cell: (data) => {
          if (data.row.original.isCreate || isDetail) return null;
          return (
            <IconButton size="large" color="error" onClick={() => handleDeleteList(data.row.original.id)}>
              <DeleteFilled />
            </IconButton>
          );
        }
      }
    ],
    []
  );

  return (
    <MainCard title={<FormattedMessage id="price" />}>
      <ReactTable columns={columns} data={mergeList} totalPagination={0} />
      {!isDetail && (
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          style={{ marginTop: 20 }}
          onClick={onAddedPrice}
          key={form.location?.length + form.customerGroup?.length}
          disabled={
            form.duration == '' ||
            form.unit == '' ||
            form.title == '' ||
            form.price == '' ||
            !form.customerGroup.length ||
            !form.location.length
          }
        >
          <FormattedMessage id="add" />
        </Button>
      )}
    </MainCard>
  );
};

export default Prices;
