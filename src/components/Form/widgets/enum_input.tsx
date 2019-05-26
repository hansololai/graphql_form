import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import { Select, Spin } from 'antd';
import { enumTypeQuery } from './__generated__/enumTypeQuery'

export interface EnumInputProps {
  value: any;
  onChange: (value: any) => void;
  enumType: string;
}
export const enumQuery = gql`
  query enumTypeQuery($name: String!){
    __type(name: $name){
      name
      kind
      enumValues{
        name
      }
    }
  }
`;

export const EnumInput: React.FC<EnumInputProps> = (props) => {
  const { value, onChange, enumType } = props;
  return <Query<enumTypeQuery> query={enumQuery} variables={{ name: enumType }}>
    {({ data, loading, error }) => {
      if (loading) return <Spin />;
      if (!data) {
        return null;
      }
      const { __type } = data;
      let options: React.ReactElement[] = [];
      if (__type) {
        const enumValues = __type.enumValues || [];
        options = enumValues.map(v => {
          return <Select.Option key={v.name} value={v.name}>{v.name}</Select.Option>
        })
      }
      return <Select
        value={value}
        onChange={onChange}
      >
        {options}
      </Select>
    }}
  </Query>

}