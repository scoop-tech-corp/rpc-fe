import React, { useEffect, useState } from 'react';
import TreatmentFormHeader from './treatment-form-header';
import { ReactTable } from 'components/third-party/ReactTable';
import { useTreatmentStore } from '../treatment-form-store';
import { getServiceListByLocation, getTreatmentById, getFrequencyList, getTaskList, getTreatmentItem, updateTreatment } from '../service';
import { useNavigate, useParams } from 'react-router';
import { snackbarError } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import { createMessageBackend } from 'service/service-global';
import useGetList from 'hooks/useGetList';
import MainCard from 'components/MainCard';
import { useIntl } from 'react-intl';

export default function App() {
  let { id } = useParams();
  const navigate = useNavigate();
  const totalColumn = useTreatmentStore((state) => state.formStep2.totalColumn);
  const treatmentDetail = useTreatmentStore((state) => state.dataSupport.treatmentDetail);
  const [totalData, setTotalData] = useState(0);
  const intl = useIntl();
  const [showEdit, setShowEdit] = useState(0);

  const { list, totalPagination, params, goToPage, setParams, orderingChange, changeLimit } = useGetList(
    getTreatmentItem,
    {
      treatments_id: id
    },
    '',
    (e) => {
      setTotalData(e.data.totalData);
    }
  );
  useEffect(() => {
    async function fetchData() {
      try {
        const getTreatmentDetail = await getTreatmentById({ id: id });

        useTreatmentStore.setState({
          ...useTreatmentStore.getState(),
          formStep2: {
            ...useTreatmentStore.getState().formStep2,
            totalColumn: getTreatmentDetail.data?.column || 0
          },
          dataSupport: {
            ...useTreatmentStore.getState().dataSupport,
            serviceList: await getServiceListByLocation({ location_id: getTreatmentDetail.data?.location_id }),
            treatmentDetail: await getTreatmentDetail.data,
            frequencyList: await getFrequencyList(),
            taskList: await getTaskList()
          }
        });
      } catch (error) {
        dispatch(snackbarError(createMessageBackend(error)));
        navigate(`/service/treatment/`);
      }
    }

    fetchData();
  }, []);

  const setTotalColumn = (e) => {
    let params = {
      id: [treatmentDetail?.id],
      column: e
    };
    updateTreatment(params)
      .then((resp) => {
        if (resp.status === 200) {
          useTreatmentStore.setState({
            formStep2: {
              totalColumn: e
            }
          });
        }
      })
      .catch((err) => {
        dispatch(snackbarError(createMessageBackend(err)));
      });
  };

  const defaultColumn = {
    Header: `${totalData} ${intl.formatMessage({ id: 'item' })} (${totalColumn} ${intl.formatMessage({ id: 'day' })})`,
    accessor: 'quantity',
    style: {
      minWidth: 150
    },
    isNotSorting: true,
    Cell: (props) => {
      const { original } = props.row;

      return (
        <>
          <button
            style={{
              color: '#4763E4',
              fontWeight: 'semibold',
              marginBottom: 0,
              marginTop: 5,
              background: 'transparent',
              border: 'none',
              padding: 0,
              display: 'block',
              cursor: 'pointer'
            }}
            onClick={() => {
              setShowEdit(original);
            }}
          >
            {original.serviceName || original.taskName || original.productName}
          </button>
          <span>{original.frequencyName}</span>
        </>
      );
    }
  };
  const [column, setColumn] = useState([{ ...defaultColumn }]);

  useEffect(() => {
    let newColumn = [{ ...defaultColumn }];

    for (let i = 0; i < totalColumn; i++) {
      newColumn.push({
        Header: `${intl.formatMessage({ id: 'day' })} ${i + 1}`,
        accessor: `day-${i + 1}`,
        style: {
          minWidth: 80
        },
        isNotSorting: true,
        Cell: (props) => {
          const { original } = props.row;
          if (original.start && i + 1 >= original.start && Number(original.start) + Number(original.duration) - 1 >= i + 1) {
            return <p style={{ color: '#4763E4', fontWeight: 'semibold' }}>{i + 1 >= original.start && i - original.start + 2}</p>;
          }
          return <p style={{ color: '#4763E4', fontWeight: 'semibold' }}>-</p>;
        }
      });
    }
    setColumn(newColumn);
  }, [totalColumn]);

  return (
    <>
      <TreatmentFormHeader setTotalColumn={setTotalColumn} setParams={setParams} showEdit={showEdit} setShowEdit={setShowEdit} />
      <MainCard content={false}>
        <div
          style={{
            width: '100%',
            height: '100%',
            overflow: 'auto',
            padding: 20
          }}
        >
          <ReactTable
            columns={column}
            data={list || []}
            colSpanPagination={totalColumn + 1}
            totalPagination={totalPagination}
            setPageNumber={params.goToPage}
            setPageRow={params.rowPerPage}
            onGotoPage={goToPage}
            onOrder={orderingChange}
            onPageSize={changeLimit}
          />
        </div>
      </MainCard>
    </>
  );
}
