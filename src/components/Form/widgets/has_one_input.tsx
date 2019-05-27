import * as React from 'react';
import { Query } from 'react-apollo';
import { useDebounce } from 'use-debounce'
import { Select, Spin } from 'antd';
import { SelectFragmentProp } from '../ModelFragments';

export type NameFunction = (p: any) => string;
export interface HasOneInputProps<TData> extends SelectFragmentProp {
  value: any;
  onChange: (value: any) => void;
}

export const HasOneInput: <TData>(props: HasOneInputProps<TData>) => React.ReactElement<HasOneInputProps<TData>> = (props) => {
  const [searchInput, setSearchInput] = React.useState('');
  const [filterText] = useDebounce(searchInput, 500);
  const { selectQuery, value, onChange, nameField, valueField, filterField } = props;
  const filter = typeof filterField === "string" ? { [filterField]: { includesInsensitive: filterText } } : filterField(filterText);

  return <Query query={selectQuery} variables={{ first: 50, filter }}>
    {({ data, loading }) => {
      // Don't know what model it is, but it should have only 1 key
      let optionData: any[] = [];
      if (Object.values(data).length > 0) {
        const allModels: any = Object.values(data)[0]
        // if using simplify-infector, then it's probably don't have the "nodes", but let's assume this now
        if (allModels.nodes) {
          optionData = allModels.nodes;
        }
      }
      return <Select
        value={value}
        placeholder="type in to search"
        notFoundContent={loading ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={setSearchInput}
        onChange={onChange}
        style={{ width: '100%' }}
      >
        {optionData.map((opt) => {
          const name = (typeof nameField === 'string') ? opt[nameField] : nameField(opt);
          const optionValue = (typeof valueField === 'string') ? opt[valueField] : valueField(opt);
          return <Select.Option key={optionValue} value={optionValue}>{name}</Select.Option>
        })}
      </Select>;
    }}
  </Query>;
}