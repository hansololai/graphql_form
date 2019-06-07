import * as React from 'react';
import { Table, Pagination } from 'antd';
import { TableProps } from 'antd/lib/table';

export interface PaginatedTableProps<T> extends TableProps<T> { };

/**
 * @summary Table with top and bottom pagination 
 * @returns {JSX.Element}
 */
const PaginatedTable = <T extends {}>(props: TableProps<T>): JSX.Element => {
  const { pagination, ...tableProps } = props;

  return (<div>
    {!!pagination && ['top', 'both'].includes(pagination.position || '') && <Pagination {...pagination} />}
    <Table
      style={{ clear: 'both' }}
      pagination={false}
      {...tableProps}
    />
    {!!pagination && ['bottom', 'both'].includes(pagination.position || '') && <Pagination {...pagination} />}
  </div>);
};

export default PaginatedTable;