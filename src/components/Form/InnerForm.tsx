
import * as React from 'react';
import { Form } from 'antd';
import { FormComponentProps, } from 'antd/lib/form'
import { createFormFields } from './utils'
import 'antd/lib/form/style';



// Generated Types
import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
import { GraphqlFormProps } from './GraphqlForm';




export interface InnerFormProps extends GraphqlFormProps, FormComponentProps {
  inputFields: patchTypeQuery___type_inputFields[];
}
const InnerForm: React.FC<InnerFormProps> = (props) => {
  const { inputFields, form, instanceData } = props;

  const allFields = createFormFields({ instanceData, fields: inputFields, options: {}, form });

  return <Form>
    {allFields}
  </Form>;
}
export const WrappedInnerForm = Form.create<InnerFormProps & FormComponentProps>()(InnerForm);


