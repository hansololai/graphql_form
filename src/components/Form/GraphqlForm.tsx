import * as React from 'react';
import { Query } from 'react-apollo';
import { updateInputQuery, modelFieldsQuery } from './queries';
import { Spin, notification } from 'antd';
import { WrappedInnerForm } from './InnerForm';
import * as SelectFragmentMapping from './ModelFragments';
import 'antd/lib/notification/style';


// Generated Types
import { patchTypeQuery } from './__generated__/patchTypeQuery';
import { fieldTypeQuery } from './__generated__/fieldTypeQuery';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { FormFieldOptionProps } from './utils';


export interface GraphqlFormProps extends FormFieldOptionProps {
  modelName: string;
  instanceData?: any;
  instanceId?: number;
  mapping?: { [x: string]: SelectFragmentMapping.SelectFragmentProp }
  onSubmit?: (form: WrappedFormUtils) => void;
}


export const GraphqlForm: React.FC<GraphqlFormProps> = (props) => {
  const { modelName, instanceData } = props;
  // If has data, then it's update, otherwise it's a create form
  const typeName = instanceData ? `${modelName}Patch` : `${modelName}Input`;
  return <Query<patchTypeQuery> query={updateInputQuery} variables={{ name: typeName }}>
    {({ data: inputData, loading: inputLoading, error: inputError }) => {
      return <Query<fieldTypeQuery> query={modelFieldsQuery} variables={{ name: modelName }}>
        {({ data, loading, error }) => {
          if (loading || inputLoading) return <Spin />;
          const hasError = error || inputError;
          if (hasError) {
            notification.error({
              message: "Error When getting the Field Info",
              description: hasError.message,
            })
            return null;
          }
          if (!data || !inputData) return null;
          const { __type: inputType } = inputData;
          const { __type: fieldType } = data;
          if (!inputType || !fieldType) return null;
          const { inputFields } = inputType;
          const { fields } = fieldType;
          return <WrappedInnerForm {...props} inputFields={inputFields || []} fields={fields || []} />;
        }}
      </Query>;
    }}
  </Query>;
}

