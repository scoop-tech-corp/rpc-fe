import PropTypes from 'prop-types';
import { forwardRef, useEffect, useRef, useState } from 'react';

// third-party
import { useDrop, useDrag, useDragLayer } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

// material-ui
import { styled as styledMaterial, useTheme, alpha } from '@mui/material/styles';

// react-table
import { useTable, useRowSelect } from 'react-table';
// import styled from 'styled-components';
import './ReactTable.css';

import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Pagination,
  Select,
  Stack,
  TableCell,
  TableRow,
  // TextField,
  Typography,
  Table,
  TableBody,
  TableHead
} from '@mui/material';

// assets
import { CaretUpOutlined, CaretDownOutlined, CloseSquareFilled, DragOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

// ==============================|| TABLE CORE ||============================== //
// const StyleTable = styled.div`
//   /* This is required to make the table full-width */
//   display: block;
//   max-width: 100%;

//   /* This will make the table scrollable when it gets too small */
//   .tableWrap {
//     display: block;
//     max-width: 100%;
//     overflow-x: scroll;
//     overflow-y: hidden;
//   }

//   table {
//     /* Make sure the inner table is always as wide as needed */
//     width: 100%;
//     border-spacing: 0;
//   }
// `;

export const ReactTable = ({
  columns,
  data,
  totalPagination,
  setPageNumber,
  setPageRow,
  onOrder,
  onGotoPage,
  onPageSize,
  colSpanPagination = 7,
  extensionRow
}) => {
  const theme = useTheme();

  const [selectedOrder, setOrder] = useState({
    column: '',
    order: ''
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data
    },
    useRowSelect
  );

  const clickHeader = (column) => {
    if (column.id === 'selection' || column.isNotSorting) return;

    const setConfigOrder = {
      column: '',
      order: ''
    };

    setConfigOrder.column = column.id;

    if (selectedOrder.column === column.id) {
      setConfigOrder.order = selectedOrder.order === 'asc' ? 'desc' : 'asc';
    } else {
      setConfigOrder.order = 'asc';
    }

    setOrder(setConfigOrder);
    onOrder(setConfigOrder);
  };

  const onChangeGotoPage = (event) => {
    onGotoPage(event);
  };

  const onChangeSetPageSize = (event) => {
    onPageSize(event);
  };

  useEffect(() => () => {});
  return (
    <>
      <Table {...getTableProps()}>
        <TableHead>
          {headerGroups.map((headerGroup, i) => (
            <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column, index) => (
                <TableCell
                  key={index}
                  {...column.getHeaderProps([{ className: column.className, style: column.style }])}
                  onClick={() => clickHeader(column)}
                >
                  <HeaderSort column={column} selectedOrder={selectedOrder} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()} className="striped">
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <TableRow
                key={i}
                {...row.getRowProps()}
                sx={{
                  cursor: 'pointer',
                  bgcolor: row.isSelected ? alpha(theme.palette.primary.lighter, 0.35) : 'inherit'
                }}
              >
                {row.cells.map((cell, i) => (
                  <TableCell key={i} {...cell.getCellProps([{ className: cell.column.className }])}>
                    {cell.render('Cell')}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {!rows.length && (
            <TableRow>
              <TableCell colSpan={10}>
                <FormattedMessage id="no-data-found" />
              </TableCell>
            </TableRow>
          )}
          {extensionRow}
          {totalPagination > 0 && (
            <TableRow>
              <TableCell sx={{ p: 2 }} colSpan={colSpanPagination}>
                {/* rows => jumlah data, pageSize => 5, 10 */}
                <TablePagination
                  gotoPage={onChangeGotoPage}
                  changePageSize={onChangeSetPageSize}
                  totalPagination={totalPagination}
                  pageIndex={0}
                  setPageNumber={setPageNumber}
                  setPageRow={setPageRow}
                  // pageSize={pageSizeChange}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {/* </div> */}
      {/* // </StyleTable> */}
    </>
  );
};

ReactTable.propTypes = {
  columns: PropTypes.array,
  data: PropTypes.array,
  totalPagination: PropTypes.number,
  setPageNumber: PropTypes.number,
  setPageRow: PropTypes.number,
  onOrder: PropTypes.func,
  onGotoPage: PropTypes.func,
  onPageSize: PropTypes.func,
  colSpanPagination: PropTypes.number,
  extensionRow: PropTypes.node
};

// ==============================|| HEADER SORT ||============================== //

export const HeaderSort = ({ column, selectedOrder }) => {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ display: 'inline-flex' }}>
      <Box>{column.render('Header')}</Box>
      {column.id !== 'selection' && !column.isNotSorting && (
        <Stack sx={{ color: 'secondary.light' }}>
          <CaretUpOutlined
            style={{
              fontSize: '0.625rem',
              color: column.id === selectedOrder.column && selectedOrder.order === 'asc' ? theme.palette.text.secondary : 'inherit'
            }}
          />
          <CaretDownOutlined
            style={{
              fontSize: '0.625rem',
              marginTop: -2,
              color: column.id === selectedOrder.column && selectedOrder.order === 'desc' ? theme.palette.text.secondary : 'inherit'
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};
HeaderSort.propTypes = { column: PropTypes.any, selectedOrder: PropTypes.any };

// ==============================|| TABLE PAGINATION ||============================== //

export const TablePagination = ({ gotoPage, totalPagination, changePageSize, setPageNumber, setPageRow }) => {
  const [open, setOpen] = useState(false);
  const [pageSize, setPageSize] = useState(5);
  const [pageIndex, setPageIndex] = useState(1);

  useEffect(() => {
    if (setPageNumber) {
      setPageIndex(setPageNumber);
    }
  }, [setPageNumber]);

  useEffect(() => {
    if (setPageRow) {
      setPageSize(setPageRow);
    }
  }, [setPageRow]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleChangePagination = (event, value) => {
    gotoPage(value);
    setPageIndex(value);
  };

  const handleChange = (event) => {
    setPageSize(+event.target.value);
    changePageSize(+event.target.value);
  };

  return (
    <Grid container alignItems="center" justifyContent="space-between" sx={{ width: 'auto' }}>
      <Grid item>
        <Stack direction="row" spacing={1} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="secondary">
              Row per page
            </Typography>
            <FormControl sx={{ m: 1 }}>
              <Select
                id="demo-controlled-open-select"
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                // @ts-ignore
                value={pageSize}
                onChange={handleChange}
                size="small"
                sx={{ '& .MuiSelect-select': { py: 0.75, px: 1.25 } }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          {/* <Typography variant="caption" color="secondary">
            Go to
          </Typography>
          <TextField
            size="small"
            type="number"
            // @ts-ignore
            value={pageIndex}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) : 0;
              setPageIndex(page);
              gotoPage(page);
            }}
            sx={{ '& .MuiOutlinedInput-input': { py: 0.75, px: 1.25, width: 36 } }}
          /> */}
        </Stack>
      </Grid>
      <Grid item sx={{ mt: { xs: 2, sm: 0 } }}>
        <Pagination
          // count={Math.ceil(rows.length / pageSize)}
          count={totalPagination}
          page={pageIndex}
          onChange={handleChangePagination}
          color="primary"
          variant="combined"
          showFirstButton
          showLastButton
        />
      </Grid>
    </Grid>
  );
};

TablePagination.propTypes = {
  gotoPage: PropTypes.func,
  totalPagination: PropTypes.number,
  changePageSize: PropTypes.func,
  setPageNumber: PropTypes.number,
  setPageRow: PropTypes.number
};

// ==============================|| SELECTION - PREVIEW ||============================== //

export const IndeterminateCheckbox = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  return <Checkbox indeterminate={indeterminate} ref={resolvedRef} {...rest} />;
});

IndeterminateCheckbox.propTypes = {
  indeterminate: PropTypes.bool
};

export const TableRowSelection = ({ selected }) => (
  <>
    {selected > 0 && (
      <Chip
        size="small"
        // @ts-ignore
        label={`${selected} row(s) selected`}
        color="secondary"
        variant="light"
        sx={{
          position: 'absolute',
          right: -1,
          top: -1,
          borderRadius: '0 4px 0 4px'
        }}
      />
    )}
  </>
);

TableRowSelection.propTypes = {
  selected: PropTypes.number
};

// ==============================|| DRAG & DROP - DRAGGABLE HEADR ||============================== //

export const DraggableHeader = ({ children, column, index, reorder }) => {
  const theme = useTheme();
  const ref = useRef();
  const { id, Header } = column;

  const DND_ITEM_TYPE = 'column';

  const [{ isOverCurrent }, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    drop: (item) => {
      reorder(item, index);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true })
    })
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: () => ({
      id,
      index,
      header: Header
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  drag(drop(ref));

  let borderColor = theme.palette.text.primary;
  if (isOverCurrent) {
    borderColor = theme.palette.primary.main;
  }

  return (
    <Box sx={{ cursor: 'move', opacity: isDragging ? 0.5 : 1, color: borderColor }} ref={ref} {...isDragging}>
      {children}
    </Box>
  );
};

DraggableHeader.propTypes = {
  column: PropTypes.any,
  sort: PropTypes.bool,
  reorder: PropTypes.func,
  index: PropTypes.number,
  children: PropTypes.node
};

// ==============================|| DRAG & DROP - DRAG PREVIEW ||============================== //

const DragHeader = styledMaterial('div')(({ theme, x, y }) => ({
  color: theme.palette.text.secondary,
  position: 'fixed',
  pointerEvents: 'none',
  left: 12,
  top: 24,
  transform: `translate(${x}px, ${y}px)`,
  opacity: 0.6
}));

export const DragPreview = () => {
  const theme = useTheme();
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging()
  }));

  const { x, y } = currentOffset || {};

  return isDragging ? (
    <DragHeader theme={theme} x={x} y={y}>
      {item.header && (
        <Stack direction="row" spacing={1} alignItems="center">
          <DragOutlined style={{ fontSize: '1rem' }} />
          <Typography>{item.header}</Typography>
        </Stack>
      )}
    </DragHeader>
  ) : null;
};

// ==============================|| DRAG & DROP - DRAGGABLE ROW ||============================== //

export const DraggableRow = ({ index, moveRow, children }) => {
  const DND_ITEM_TYPE = 'row';

  const dropRef = useRef(null);
  const dragRef = useRef(null);

  const [, drop] = useDrop({
    accept: DND_ITEM_TYPE,
    hover(item, monitor) {
      if (!dropRef.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }

      // @ts-ignore
      const hoverBoundingRect = dropRef.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      moveRow(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  // @ts-ignore
  const [{ isDragging }, drag, preview] = useDrag({
    type: DND_ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const opacity = isDragging ? 0 : 1;

  preview(drop(dropRef));
  drag(dragRef);

  return (
    <TableRow ref={dropRef} style={{ opacity, backgroundColor: isDragging ? 'red' : 'inherit' }}>
      <TableCell ref={dragRef} sx={{ cursor: 'pointer', textAlign: 'center' }}>
        <DragOutlined />
      </TableCell>
      {children}
    </TableRow>
  );
};

DraggableRow.propTypes = {
  moveRow: PropTypes.func,
  index: PropTypes.number,
  children: PropTypes.node
};

// ==============================|| COLUMN HIDING - SELECT ||============================== //

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200
    }
  }
};

export const HidingSelect = ({ hiddenColumns, setHiddenColumns, allColumns }) => {
  const handleChange = (event) => {
    const {
      target: { value }
    } = event;

    setHiddenColumns(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <FormControl sx={{ width: 200 }}>
      <Select
        id="column-hiding"
        multiple
        displayEmpty
        value={hiddenColumns}
        onChange={handleChange}
        input={<OutlinedInput id="select-column-hiding" placeholder="select column" />}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return <Typography variant="subtitle1">all columns visible</Typography>;
          }

          if (selected.length > 0 && selected.length === allColumns.length) {
            return <Typography variant="subtitle1">all columns hidden</Typography>;
          }

          return <Typography variant="subtitle1">{selected.length} column(s) hidden</Typography>;
        }}
        MenuProps={MenuProps}
        size="small"
      >
        {allColumns.map((column, index) => (
          <MenuItem key={index} value={column.id}>
            <Checkbox
              checked={hiddenColumns.indexOf(column.id) > -1}
              color="error"
              checkedIcon={
                <Box
                  className="icon"
                  sx={{
                    width: 16,
                    height: 16,
                    border: '1px solid',
                    borderColor: 'inherit',
                    borderRadius: 0.25,
                    position: 'relative'
                  }}
                >
                  <CloseSquareFilled className="filled" style={{ position: 'absolute' }} />
                </Box>
              }
            />
            <ListItemText primary={typeof column.Header === 'string' ? column.Header : column?.title} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

HidingSelect.propTypes = {
  setHiddenColumns: PropTypes.func,
  hiddenColumns: PropTypes.array,
  allColumns: PropTypes.array
};

// ==============================|| COLUMN SORTING - SELECT ||============================== //

export const SortingSelect = ({ sortBy, setSortBy, allColumns }) => {
  const [sort, setSort] = useState(sortBy);

  const handleChange = (event) => {
    const {
      target: { value }
    } = event;
    setSort(value);
    setSortBy([{ id: value, desc: false }]);
  };

  return (
    <FormControl sx={{ width: 200 }}>
      <Select
        id="column-hiding"
        displayEmpty
        value={sort}
        onChange={handleChange}
        input={<OutlinedInput id="select-column-hiding" placeholder="Sort by" />}
        renderValue={(selected) => {
          const selectedColumn = allColumns.filter((column) => column.id === selected)[0];
          if (!selected) {
            return <Typography variant="subtitle1">Sort By</Typography>;
          }

          return (
            <Typography variant="subtitle2">
              Sort by ({typeof selectedColumn.Header === 'string' ? selectedColumn.Header : selectedColumn?.title})
            </Typography>
          );
        }}
        size="small"
      >
        {allColumns
          .filter((column) => column.canSort)
          .map((column) => (
            <MenuItem key={column.id} value={column.id}>
              <ListItemText primary={typeof column.Header === 'string' ? column.Header : column?.title} />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

SortingSelect.propTypes = {
  setSortBy: PropTypes.func,
  sortBy: PropTypes.string,
  allColumns: PropTypes.array
};
