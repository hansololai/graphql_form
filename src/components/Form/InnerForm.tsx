
import * as React from 'react';
import { Form, Button, notification } from 'antd';
import { createFormFields } from './utils'
import 'antd/lib/form/style';
import 'antd/lib/button/style';
const {useForm} = Form;

// Generated Types
import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
// import { fieldTypeQuery___type_fields } from './__generated__/fieldTypeQuery'
import { GraphqlFormProps } from './GraphqlForm';

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
}
const formLayout = {
  labelCol: {span: 8},
  wrapperCol: {span: 16},
}
const tailLayout = {
  wrappedCol: {offset: 0, span: 16},
}

export interface InnerFormTypeProps {
  inputFields: patchTypeQuery___type_inputFields[];
  // fields: fieldTypeQuery___type_fields[];
}
export interface InnerFormProps<T> extends GraphqlFormProps<T>, InnerFormTypeProps { };

const InnerForm: React.SFC<InnerFormProps<FormData>> = (props) => {
  const { onSubmit, instanceData, ...options } = props;
  const [form] = useForm<FormData>();
  React.useEffect(() => {
    if (instanceData) {
      form.setFieldsValue(instanceData);
    }
  }, [instanceData]);

  const allFields = createFormFields({ ...options, form });

  return <Form form={form} {...formLayout} onFinish={(values) => {
    form.validateFields().then(()=>{
      if (onSubmit) {
        onSubmit(form);
      }
    }).catch(err=>{
      notification.error({
        message:'Validation Failed',
        description: err.message,
      });
    });
  }}>
    {allFields}
    {onSubmit &&
      <Form.Item {...tailLayout}>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>}
  </Form>;
}
export const WrappedInnerForm = InnerForm;


