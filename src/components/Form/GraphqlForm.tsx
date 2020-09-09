import * as React from 'react';
import {
 Spin, notification, Form, Button,
} from 'antd';
import {
 FormInstance, Rule, FormItemProps, FormProps,
} from 'antd/lib/form';
import { updateInputQuery } from './queries';

// Generated Types
import { patchTypeQuery } from './__generated__/patchTypeQuery';
// import { fieldTypeQuery } from './__generated__/fieldTypeQuery';
import { useQueryWithError, createFormFields } from './utils';

import { ValidatorFunc } from './InputWrapper';
import 'antd/lib/form/style';
import 'antd/lib/button/style';
import 'antd/lib/notification/style';

const { useForm } = Form;

export interface FormFieldOptionProps {
  customValidators?: { [x: string]: ValidatorFunc };
  customRules?: { [x: string]: Rule[] };
  customDecorators?: { [x: string]: FormItemProps};
  customWidgets?: { [x: string]: React.SFC<{ value: any, onChange: (p: any) => void }> };
}

export interface GraphqlFormProps<FormData = any> extends FormFieldOptionProps, FormProps {
  modelName: string;
  instanceData?: FormData;
  instanceId?: number;
  onSubmit?: (form: FormInstance<FormData>) => void;
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
export const GraphqlForm: React.SFC<GraphqlFormProps> = (props) => {
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
    if (!inputData) {
      return [];
    }
    const { __type: theType } = inputData;
    return theType?.inputFields || [];
  }, [inputData]);
  const [form] = useForm<FormData>();
  React.useEffect(() => {
    if (instanceData) {
      form.setFieldsValue(instanceData);
    }
  }, [instanceData]);

  const allFields = createFormFields({
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
