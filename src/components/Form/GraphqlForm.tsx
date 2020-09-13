import * as React from 'react';
import {
 Spin, notification, Form, Button,
} from 'antd';
import {
 FormInstance, Rule, FormItemProps, FormProps,
} from 'antd/lib/form';
import { updateInputQuery } from './queries';

// Generated Types
import { patchTypeQuery, patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery';
// import { fieldTypeQuery } from './__generated__/fieldTypeQuery';
import { useQueryWithError, createFormFields } from './utils';

import 'antd/lib/form/style';
import 'antd/lib/button/style';
import 'antd/lib/notification/style';

const { useForm } = Form;

export interface WidgetProp<FData, WData = any> {
  value?: WData;
  onChange?: (p: WData)=>void;
  form?: FormInstance<FData>;
  disable?: boolean;
  hidden?:boolean;
}
export type ValidatorFunc = <T extends unknown>(rule: any, value: any,
  callback: any, form?: FormInstance<T>) => any;

export interface FormFieldOptionProps<FData> {
  customValidators?: { [x: string]: ValidatorFunc };
  customRules?: { [x: string]: Rule[] };
  customDecorators?: { [x: string]: FormItemProps};
  customWidgets?: { [x: string]: React.SFC<WidgetProp<FData>> };
  extraProps?:{[x:string]:any};
  customWidgetFunc?:(field: patchTypeQuery___type_inputFields) => React.ReactNode;
}
// Ths type is used by Antd Form, but it is not exported, so we redeclare here.
declare type RecursivePartial<T> = T extends object ? {
    [P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[] :
    T[P] extends object ? RecursivePartial<T[P]> : T[P];
} : any;
export interface GraphqlFormProps<FData = any> extends FormFieldOptionProps<FData>, FormProps {
  modelName: string;
  instanceData?: RecursivePartial<FData>;
  instanceId?: number;
  onSubmit?: (form: FormInstance<FData>) => void;
  fields?: patchTypeQuery___type_inputFields[];
  idIsBigInt?:boolean;
  submitButtonText?:string;
}
export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrappedCol: { offset: 0, span: 16 },
};

/**
 * @description Main Component of graphql form.
 * @param props extends the Antd Form props, with some extra parameters
 */
export const GraphqlForm = <FData extends object>(props:GraphqlFormProps<FData>) => {
  const {
 modelName, instanceData, instanceId, onSubmit, ...options
} = props;
  const {
customValidators, customRules, customDecorators, customWidgets, ...formProps
} = options;
  // If has data, then it's update, otherwise it's a create form
  const typeName = instanceData ? `${modelName}Patch` : `${modelName}Input`;
  const [submitting, setSubmitting] = React.useState(false);
  const {
    data: inputData, loading: inputLoading,
  } = useQueryWithError<patchTypeQuery>(updateInputQuery, { variables: { name: typeName } });

  const inputFields = React.useMemo(() => {
    const { __type: theType } = inputData || {};
    return theType?.inputFields || [];
  }, [inputData]);
  const [form] = useForm<FData>();
  React.useEffect(() => {
    if (instanceData) {
      form.setFieldsValue(instanceData);
    }
  }, [instanceData]);

  const allFields = createFormFields<FData>({
form,
inputFields,
customValidators,
    customRules,
customDecorators,
customWidgets,
});

  if (inputLoading) {
    return <Spin />;
  }

  return (
    <Form
      form={form}
      labelCol={formLayout.labelCol}
      wrapperCol={formLayout.wrapperCol}
      onFinish={() => {
        setSubmitting(true);
        form.validateFields().then(() => {
          setSubmitting(false);
          if (onSubmit) {
            onSubmit(form);
          }
        }).catch((err) => {
          setSubmitting(false);
          notification.error({
            message: 'Validation Failed',
            description: err.message,
          });
        });
      }}
      initialValues={instanceData}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...formProps}
    >
      {allFields}
      {onSubmit
      && (
      <Form.Item wrapperCol={tailLayout.wrappedCol}>
        <Button type="primary" htmlType="submit" loading={submitting}>Submit</Button>
      </Form.Item>
)}
    </Form>
);
};
