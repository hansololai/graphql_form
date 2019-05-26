import * as React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import { Spin } from 'antd';
import { WrappedInnerForm } from './InnerForm';


// Generated Types
import { patchTypeQuery } from './__generated__/patchTypeQuery'
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { FormFieldOptionProps } from './utils';


export interface GraphqlFormProps extends FormFieldOptionProps {
  modelName: string;
  instanceData?: any;
  instanceId?: number;
  onSubmit?: (form: WrappedFormUtils) => void;
}
export const updateInputQuery = gql`
  query patchTypeQuery($name: String!){
    __type(name: $name){
      inputFields{
        name
        defaultValue
        type{
          name
          kind
          ofType{
            name
            kind
          }
        }
      } 
    }
  } 
`;



export const GraphqlForm: React.FC<GraphqlFormProps> = (props) => {
  const { modelName, instanceData } = props;
  // If has data, then it's update, otherwise it's a create form
  const typeName = instanceData ? `${modelName}Patch` : `${modelName}Input`;
  return <Query<patchTypeQuery> query={updateInputQuery} variables={{ name: typeName }}>
    {({ data, loading, error }) => {
      if (loading) return <Spin />;
      if (!data) return null;
      const { __type } = data as patchTypeQuery;
      if (!__type) return null;
      const { inputFields } = __type;
      if (!inputFields) return null;
      return <WrappedInnerForm {...props} inputFields={inputFields} />;
    }}
  </Query>;
}

