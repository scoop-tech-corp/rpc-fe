import { Button, Link, Stack } from '@mui/material';
import { IndeterminateCheckbox, ReactTable } from 'components/third-party/ReactTable';
import { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { deleteRequirePersonalData, getRequirePersonalData } from '../service';
import { GlobalFilter } from 'utils/react-table';
import { DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { snackbarError, snackbarSuccess } from 'store/reducers/snackbar';
import { createMessageBackend } from 'service/service-global';

import ScrollX from 'components/ScrollX';
import useGetList from 'hooks/useGetList';
import ConfirmationC from 'components/ConfirmationC';
import FormRequirePersonalData from './FormRequirePersonalData';

const TabRequirePersonalData = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const { list, totalPagination, params, setParams, goToPage, keyword, changeKeyword, orderingChange, changeLimit } = useGetList(
    getRequirePersonalData,
    {},
    'keyword'
  );
  const [dialog, setDialog] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [openForm, setOpenForm] = useState({ isOpen: false, id: null });

  const column = useMemo(
    () => [
      {
        title: 'Row Selection',
        Header: (header) => {
          useEffect(() => {
            const selectRows = header.selectedFlatRows.map(({ original }) => original.id);
            setSelectedRow(selectRows);
          }, [header.selectedFlatRows]);

          return <IndeterminateCheckbox indeterminate {...header.getToggleAllRowsSelectedProps()} />;
        },
        accessor: 'selection',
        Cell: (cell) => <IndeterminateCheckbox {...cell.row.getToggleRowSelectedProps()} />,
        disableSortBy: true,
        style: {
          width: '10px'
        }
      },
      {
        Header: <FormattedMessage id="role" />,
        accessor: 'jobName',
        Cell: (data) => {
          const id = data.row.original.id;
          const jobName = data.row.original.jobName;
          return <Link onClick={() => setOpenForm({ isOpen: true, id })}>{jobName}</Link>;
        }
      },
      {
        Header: <FormattedMessage id="mandatory" />,
        accessor: 'require',
        Cell: (data) => {
          const requires = data.row.original.require;
          let result = '';
          requires.forEach((dt, idx) => (result += `${dt}${requires.length - 1 !== idx ? ', ' : ''}`));
          return result;
        }
      }
    ],
    []
  );

  const onConfirm = async (value) => {
    if (value) {
      await deleteRequirePersonalData(selectedRow)
        .then((resp) => {
          if (resp.status === 200) {
            setDialog(false);
            dispatch(snackbarSuccess('Success Delete Data'));
            setParams((_params) => ({ ..._params }));
          }
        })
        .catch((err) => {
          if (err) {
            dispatch(snackbarError(createMessageBackend(err)));
          }
        });
    } else {
      setDialog(false);
    }
  };

  return (
    <>
      <Stack spacing={3}>
        <Stack spacing={1} flexDirection={'row'} alignContent={'center'} justifyContent={'space-between'}>
          <Stack spacing={1} flexDirection={'row'} gap={2}>
            <GlobalFilter
              placeHolder={intl.formatMessage({ id: 'search' })}
              globalFilter={keyword}
              setGlobalFilter={changeKeyword}
              style={{ height: '41.3px' }}
            />
            {selectedRow.length > 0 && (
              <Button variant="contained" startIcon={<DeleteFilled />} color="error" onClick={() => setDialog(true)}>
                <FormattedMessage id="delete" />
              </Button>
            )}
          </Stack>
          <Stack spacing={1}>
            <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => setOpenForm({ isOpen: true, id: null })}>
              <FormattedMessage id="new" />
            </Button>
          </Stack>
        </Stack>
        <ScrollX>
          <ReactTable
            columns={column}
            data={list || []}
            totalPagination={totalPagination}
            setPageNumber={params.goToPage}
            setPageRow={params.rowPerPage}
            onOrder={orderingChange}
            onGotoPage={goToPage}
            onPageSize={changeLimit}
          />
        </ScrollX>
      </Stack>
      <ConfirmationC
        open={dialog}
        title={<FormattedMessage id="delete" />}
        content={<FormattedMessage id="are-you-sure-you-want-to-delete-this-data" />}
        onClose={(response) => onConfirm(response)}
        btnTrueText="Ok"
        btnFalseText="Cancel"
      />
      {openForm.isOpen && (
        <FormRequirePersonalData
          open={openForm.isOpen}
          id={openForm.id}
          onClose={(val) => {
            setOpenForm({ isOpen: false, id: null });
            if (val) setParams((_params) => ({ ..._params }));
          }}
        />
      )}
    </>
  );
};

export default TabRequirePersonalData;
