import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { updateInputQuery } from './queries';
import { Spin, notification } from 'antd';
import { WrappedInnerForm } from './InnerForm';
import * as SelectFragmentMapping from './ModelFragments';
import 'antd/lib/notification/style';


// Generated Types
import { patchTypeQuery } from './__generated__/patchTypeQuery';
// import { fieldTypeQuery } from './__generated__/fieldTypeQuery';
import { FormFieldOptionProps } from './utils';
import { FormInstance } from 'antd/lib/form';


export interface GraphqlFormProps<FormData = any> extends FormFieldOptionProps {
  modelName: string;
  instanceData?: FormData;
  instanceId?: number;
  mapping?: { [x: string]: SelectFragmentMapping.SelectFragmentProp }
  onSubmit?: (form: FormInstance<FormData>) => void;
}


export const GraphqlForm: React.SFC<GraphqlFormProps> = (props) => {
  const { modelName, instanceData } = props;
  // If has data, then it's update, otherwise it's a create form
  const typeName = instanceData ? `${modelName}Patch` : `${modelName}Input`;
  const { data: inputData,
    loading: inputLoading,
    error: inputError } = useQuery<patchTypeQuery>(updateInputQuery,
      { variables: { name: typeName } })
  // const { data, loading, error } = useQuery<fieldTypeQuery>(modelFieldsQuery,
  //   { variables: { name: modelName } });

  if (inputLoading) return <Spin />;
  const hasError = inputError;
  if (hasError) {
    notification.error({
      message: "Error When getting the Field Info",
      description: hasError.message,
    })
  }
  if (!inputData) return null;
  const { __type: inputType } = inputData;
  if (!inputType) return null;
  const { inputFields } = inputType;
  return <WrappedInnerForm {...props} inputFields={inputFields || []} />;
}

