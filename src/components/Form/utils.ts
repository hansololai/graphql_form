import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
import { WrappedFormInternalProps } from 'antd/lib/form/Form'
import { InnerFormProps } from './InnerForm';
import { BooleanInput, TextInput, NumberInput, DateInput, TimeInput } from './widgets';

export const isFunction = (funcToCheck) => {
  if (!funcToCheck) return false;
  return {}.toString.call(funcToCheck) === '[object Function]';
}

const nameToFormFieldMapping = {
  Boolean: BooleanInput,
  String: TextInput,
  Datetime: TimeInput,
  Date: DateInput,
  Int: NumberInput,
  BigInput: NumberInput,
  Float: NumberInput,
  BigFloat: NumberInput,
}

export type PossibleTypeNames = keyof typeof nameToFormFieldMapping;
export const handlableTypeName: (type: string) => type is PossibleTypeNames = () => {
  if (['Boolean', 'String', 'Datetime', 'Date', 'Int', 'BigInt', 'Float', 'BigFloat'].includes(type)) {
    return true;
  }
  return false;
}

interface createFormFieldsProps extends WrappedFormInternalProps<InnerFormProps> {
  fields: patchTypeQuery___type_inputFields[];
  instanceData: object;
  options: any;
}
const createFormFields: (props: createFormFieldsProps) => React.ReactNode[] = (props) => {
  const { fields, instanceData, form, options } = props;
  return fields.map(field => {
    const { name: fieldName, type } = field;
    // Sometimes it's not null,  then have to go one level deeper
    const info = type.kind === 'NON_NULL' ? type.ofType : type;
    if (!info) return null;

    const { kind, name: typeName } = info;
    // Here we try to create the Form Item for this field. Have to check the type, and add extra fields etc.
    const fieldProps = {
      form
    };
    // Here check for some override settings

    // Based on Type
    if (kind === 'SCALAR') {
      if (handlableTypeName(typeName)) {

      }
    }

  })
}