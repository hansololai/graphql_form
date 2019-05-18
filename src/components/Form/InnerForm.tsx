
import * as React from 'react';
import { Form } from 'antd';
import { FormComponentProps, } from 'antd/lib/form'



// Generated Types
import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
import { GraphqlFormProps } from './GraphqlForm';




export interface InnerFormProps extends GraphqlFormProps {
  inputFields: patchTypeQuery___type_inputFields[];
}
const InnerForm: React.FC<FormComponentProps<InnerFormProps>> = (props) => {
  const { inputFields, form, instanceData } = props;

  const allFields = 

  return <Form>

  </Form>;
}
export const WrappedInnerForm = Form.create<InnerFormProps & FormComponentProps>()(InnerForm);


