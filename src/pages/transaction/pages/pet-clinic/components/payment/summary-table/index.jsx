import { Box, TableCell, TableRow } from '@mui/material';
import { ReactTable } from 'components/third-party/ReactTable';
import { FormattedMessage } from 'react-intl';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import ScrollX from 'components/ScrollX';

const SummaryTable = (props) => {
  const { formValue } = props;

  const SubRow = ({ row, rowProps }) => {
    console.log('row', row.original.included_items);
    const mock = [
      {
        no: 1,
        productName: 'whiskas',
        category: 'Produk Jual',
        quantity: '2',
        bonus: '1',
        discount: '0%',
        unitPrice: '25.000',
        totalPrice: '50.000',
        subRows: null
      }
    ];
    return (
      <>
        {row.original.included_items.map((x, i) => (
          <TableRow key={`sub-${i}`} {...{ ...rowProps, key: `${i}-${rowProps.key}` }}>
            {row.cells.map((cell, index) => (
              <TableCell key={index} {...cell.getCellProps([{ className: cell.column.className }])}>
                {cell.render(cell.column.SubCell ? 'SubCell' : 'Cell', {
                  value: cell.column.accessor && cell.column.accessor(x, i),
                  row: { ...row, original: x }
                })}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </>
    );
  };
  const renderRowSubComponent = useCallback(({ row, rowProps }) => <SubRow row={row} rowProps={rowProps} />, []);

  const columnSummary = useMemo(
    () => [
      {
        Header: () => null,
        isNotSorting: true,
        id: 'expander',
        className: 'cell-center',
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? <DownOutlined /> : <RightOutlined />;
          const isHaveRowChild = row.original.included_items?.length;
          if (isHaveRowChild) {
            return (
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }} {...row.getToggleRowExpandedProps()}>
                {collapseIcon}
              </Box>
            );
          } else {
            return <></>;
          }
        },
        SubCell: () => null
      },
      {
        Header: 'No',
        accessor: 'no',
        isNotSorting: true,
        Cell: (data) => data.row.index + 1
      },
      {
        Header: <FormattedMessage id="product-name" />,
        accessor: 'item_name',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="category" />,
        accessor: 'category',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="quantity" />,
        accessor: 'quantity',
        isNotSorting: true
      },
      {
        Header: 'Bonus',
        accessor: 'bonus',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="discount" />,
        accessor: 'discount',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="unit-price" />,
        accessor: 'unit_price',
        isNotSorting: true
      },
      {
        Header: <FormattedMessage id="total-price" />,
        accessor: 'total',
        isNotSorting: true
      }
    ],
    []
  );

  return (
    <ScrollX>
      <ReactTable
        columns={columnSummary}
        data={formValue.summaryList || []}
        renderRowSubComponent={renderRowSubComponent}
        extensionRow={
          <>
            {Boolean(formValue.summaryList.length) && (
              <>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <b>Subtotal</b>
                  </TableCell>
                  <TableCell>{formValue.summarySubtotal}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <b>
                      {/* <FormattedMessage id="discount-nominal" /> */}
                      {formValue.summaryDiscountNote}
                    </b>
                  </TableCell>
                  <TableCell>{formValue.summaryTotalDiscount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell>
                    <b>
                      <FormattedMessage id="total-payment" />
                    </b>
                  </TableCell>
                  <TableCell>{formValue.summaryTotalPayment}</TableCell>
                </TableRow>
              </>
            )}
          </>
        }
      />
    </ScrollX>
  );
};

SummaryTable.propTypes = {
  formValue: PropTypes.any
};

export default SummaryTable;
