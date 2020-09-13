import * as React from 'react';
import { useDebounce } from 'use-debounce';
import { Select, Spin } from 'antd';
import { SelectFragmentProp } from '../ModelFragments';
import { useQueryWithError } from '../utils';

export type NameFunction = (p: any) => string;
export interface HasOneInputProps extends SelectFragmentProp {
  value?: any;
  onChange?: (value: any) => void;
}

/**
 * @description Has One input, this would be a drop down for selecting associaitons. Still under development
 */
export const HasOneInput: (props: HasOneInputProps
  ) => React.ReactElement<HasOneInputProps> = (props) => {
  const [searchInput, setSearchInput] = React.useState('');
  const [filterText] = useDebounce(searchInput, 500);
  const {
 selectQuery, value, onChange, nameField, valueField = 'id', filterField,
} = props;
  const filter = typeof filterField === 'string' ? { [filterField]: { includesInsensitive: filterText } } : filterField(filterText);
  const {
    data, loading,
  } = useQueryWithError<any>(selectQuery, { variables: { first: 50, filter } });

  const optionData: object[] = React.useMemo(() => {
    if (Object.values(data || {}).length > 0) {
      const allModels: any = Object.values(data || {})[0];
      // if using simplify-infector, then it's probably don't have the "nodes", but let's assume this now
      if (allModels.nodes) {
        return allModels.nodes;
      }
    }
    return [];
  }, []);
  return (
    <Select
      showSearch={!!filterField}
      loading={loading}
      value={value}
      notFoundContent={loading ? <Spin size="small" /> : null}
      onSearch={setSearchInput}
      onChange={onChange}
      style={{ width: '100%' }}
    >
      {optionData.map((opt) => {
      const name = (typeof nameField === 'string') ? opt[nameField] : nameField(opt);
      const optionValue = (typeof valueField === 'string') ? opt[valueField] : valueField(opt);
      return <Select.Option key={optionValue} value={optionValue}>{name}</Select.Option>;
    })}
    </Select>
);
};
