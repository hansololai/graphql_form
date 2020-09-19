import * as React from 'react';
import gql from 'graphql-tag';
import { Select, notification } from 'antd';
import { useQuery } from '@apollo/react-hooks';
import { enumTypeQuery, enumTypeQueryVariables } from './__generated__/enumTypeQuery';
import { WidgetProp } from '../GraphqlForm';

export interface EnumInputProps extends WidgetProp<any, string> {
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

/**
 * @description Input for Enum type, it is a select dropdown
 */
export const EnumInput: React.FC<EnumInputProps> = (props) => {
  const { value, onChange, enumType } = props;
  const {
    data, loading, error,
  } = useQuery<enumTypeQuery, enumTypeQueryVariables>(enumQuery, { variables: { name: enumType } });
  if (error) {
    notification.error({
      message: `Error Fetching options for ${enumType}`,
      description: error.message,
    });
  }
  const enumValues = React.useMemo(() => {
    const { __type: theType } = data || {};
    return theType?.enumValues || [];
  }, [data]);
  const options = enumValues.map((v) => (
    <Select.Option
      key={v.name}
      value={v.name}
    >
      {v.name}
    </Select.Option>
));
  return (
    <Select
      value={value}
      onChange={onChange}
      loading={loading}
    >
      {options}
    </Select>
);
};
