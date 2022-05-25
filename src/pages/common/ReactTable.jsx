import React, { useEffect } from "react";
import { useTable, usePagination, useRowSelect} from "react-table";
import "../../styles/StylingFile.css";

const Table = ({ columns, data, setSelectedRows}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    selectedFlatRows,
    state: { pageIndex, pageSize, selectedRowIds, toggleAllRowsSelected },
  } = useTable(
    { 
      columns, 
      data,
      initialState: { pageIndex: 0, pageSize: 10 }
    },
    usePagination,
    useRowSelect,
    hooks => {
      let counter = 0;
      hooks.visibleColumns.push(columns => [
        {
          id: 'selection',
          Header: () => <div/>, // no header for checkbox. max 3 can be selected
          Cell: ({ row }) => {
            if (rows.filter((row) => row.isSelected).length < 3 || row.isSelected) {
              return (
                <div>
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              );
            } else {
              return (
                <div>
                  <IndeterminateCheckbox
                    disabled={true}
                    style={row.getToggleRowSelectedProps().style}
                  />
                </div>
              );
            }
          },
        },
        ...columns,
      ])
    }
  );

  const onChangeInSelect = (event) => {
    setPageSize(Number(event.target.value));
  };

  const onChangeInInput = (event) => {
    const page = event.target.value ? Number(event.target.value) - 1 : 0;
    gotoPage(page);
  };

  const IndeterminateCheckbox = React.forwardRef(
    ({ indeterminate, ...rest }, ref) => {
      const defaultRef = React.useRef()
      const resolvedRef = ref || defaultRef
  
      React.useEffect(() => {
        resolvedRef.current.indeterminate = indeterminate
      }, [resolvedRef, indeterminate])

      return (
        <>
          <input type="checkbox" ref={resolvedRef} {...rest} />
        </>
      )
    }
  )

  useEffect(() => {
    setSelectedRows(selectedFlatRows.map(row => row.original));
  }, [setSelectedRows, selectedFlatRows]);
  

  return (
    <div class="padding-bottom-smaller">
    <div>
    <table
      {...getTableProps()}
      style={{ border: "solid 1px black", width: "60vw", margin: "0 auto" }}
    >
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()} class="react-table-headers text-medium-xx padding-micro">
                  {column.render("Header")}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {page.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td
                    {...cell.getCellProps()}
                    class="react-table-cells text-medium-xx padding-tiniest"
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
    </div>
    
    <div className="row margin-top-tinier ">
      <div class="col-lg-5 inner-float-right padding-right-tiny">
        <button class="crypto_button"
          onClick={previousPage}
          disabled={!canPreviousPage}>
          {'< Previous'}
        </button>
        <button class="crypto_button margin-right-micro" 
          onClick={(e) => gotoPage(0)}
          disabled={!canPreviousPage}>
          {'<< First'}
        </button>
      </div>
      <div class="col-lg-2 text-large center-xs">
        Page{' '}
        <input
          type='number'
          min={1}
          class="pagination-pagebox"
          max={pageOptions.length}
          value={pageIndex + 1}
          defaultValue={pageIndex + 1}
          onChange={onChangeInInput}
        />
        <strong class="margin-right-tiniest padding-left-micro">
          of {pageOptions.length}
        </strong>
      </div>
      <div class="col-lg-5 inner-float-left">
        <button class="crypto_button margin-right-micro padding-left-tiny" 
          onClick={nextPage} disabled={!canNextPage}>
          {'Next >'}
        </button>
        <button class="crypto_button margin-right-small padding-left-tiny"
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}>
          {'Last >>'}
        </button>
        <select class="pagination-display-dropdown padding-left-tiniest"
          value={pageSize}
          onChange={onChangeInSelect}>
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
    </div>
  );
};
export default Table;
