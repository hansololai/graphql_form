
import * as React from 'react';
import { Form, Button } from 'antd';
import { FormComponentProps, } from 'antd/lib/form'
import { createFormFields } from './utils'
import 'antd/lib/form/style';
import 'antd/lib/button/style';



// Generated Types
import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
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


export interface InnerFormProps extends GraphqlFormProps, FormComponentProps {
  inputFields: patchTypeQuery___type_inputFields[];
}
const InnerForm: React.FC<InnerFormProps> = (props) => {
  const { inputFields, form, instanceData, onSubmit } = props;

  const allFields = createFormFields({ instanceData, fields: inputFields, options: {}, form });

  return <Form onSubmit={(e) => {
    e.preventDefault();

    form.validateFields((err, values) => {
      if (!err) {
        // passed validation
        const { onSubmit } = props;
        if (onSubmit) {
          onSubmit(form);
        }
      }
    })
  }}>
    {allFields}
    {onSubmit &&
      <Form.Item {...formItemLayout}>
        <Button type="primary" htmlType="submit">Submit</Button>
      </Form.Item>}
  </Form>;
}
export const WrappedInnerForm = Form.create<InnerFormProps & FormComponentProps>()(InnerForm);


