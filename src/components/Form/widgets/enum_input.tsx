import * as React from 'react';
import gql from 'graphql-tag';
import { Select, notification } from 'antd';
import { enumTypeQuery, enumTypeQueryVariables } from './__generated__/enumTypeQuery'
import { useQuery } from '@apollo/react-hooks';

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
  const {data, loading, error} = useQuery<enumTypeQuery, enumTypeQueryVariables>(enumQuery, {variables:{name: enumType}});
  if(error){
    notification.error({
      message:`Error Fetching options for ${enumType}`,
      description: error.message,
    });
  }
  const enumValues = React.useMemo(()=>{
    return data?.__type?.enumValues || [];
  },[data]);
  const options = enumValues.map(v => {
    return <Select.Option key={v.name} value={v.name}>{v.name}</Select.Option>
  });
  return <Select
  value={value}
  onChange={onChange}
  loading={loading}
  >
    {options}
  </Select>
}