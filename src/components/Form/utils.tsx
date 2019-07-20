import { WrappedFormInternalProps, ValidationRule, GetFieldDecoratorOptions } from 'antd/lib/form/Form';
import { InnerFormProps, InnerFormTypeProps } from './InnerForm';
import { BooleanInput, TextInput, NumberInput, DateInput, TimeInput, EnumInput, HasOneInput } from './widgets/index';
import * as moment from 'moment';
import { InputWrapper, InputWrapperProps, validatorFunc } from './InputWrapper';
import * as React from 'react';
import { SelectFragmentProp } from './ModelFragments';
import { patchTypeQuery___type_inputFields, patchTypeQuery___type_inputFields_type_ofType } from './__generated__/patchTypeQuery';

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
export function handlableTypeName(type: any): type is PossibleTypeNames {
  if (['Boolean', 'String', 'Datetime', 'Date', 'Int', 'BigInt', 'Float', 'BigFloat'].includes(type)) {
    return true;
  }
  return false;
}
export interface FormFieldOptionProps {
  customValidators?: { [x: string]: validatorFunc };
  customRules?: { [x: string]: ValidationRule[] };
  customDecorators?: { [x: string]: GetFieldDecoratorOptions };
  customWidgets?: { [x: string]: React.FC<{ value: any, onChange: (p: any) => void }> };
}
export interface createFormFieldsProps extends WrappedFormInternalProps<InnerFormProps>, FormFieldOptionProps, InnerFormTypeProps {
  mapping?: { [x: string]: SelectFragmentProp };
  instanceData: object;
}
export const createFormFields: (props: createFormFieldsProps) => React.ReactNode[] = (props) => {
  const { fields, inputFields, instanceData = {}, form, customDecorators = {},
    customRules = {}, customValidators = {}, customWidgets = {},
    mapping = {},
  } = props;
  // fields are going to be used as reference to check if it's a foreign key, let's process it once first
  // it is a keyName => modelName mapping
  const foreignKeys: { [x: string]: string } = {};
  fields.forEach(f => {
    const { name: fieldName, type: { name: typeName, kind } } = f;
    if (kind === 'OBJECT' && fieldName.includes('By') && typeName) {
      // It is a foreign key
      const keyName = fieldName.substring(fieldName.indexOf('By'));
      if (keyName) foreignKeys[keyName] = typeName;
    }
  });

  return inputFields.map(field => {
    const { name: fieldName, type } = field;
    // Sometimes it's not null,  then have to go one level deeper
    const info = inputFieldKind(field);
    if (!info) return null;

    const { kind, name: typeName } = info;
    // Here we try to create the Form Item for this field. Have to check the type, and add extra fields etc.
    const fieldProps: InputWrapperProps = {
      form,
      name: fieldName,
      type,
      value: instanceData[fieldName],
      hidden: false,
      disabled: false,
    };
    // Here check for some override settings
    if (customDecorators[fieldName]) {
      fieldProps.options = customDecorators[fieldName];
    }
    if (customRules[fieldName]) {
      fieldProps.customRules = customRules[fieldName];
    }
    if (customValidators[fieldName]) {
      fieldProps.validator = customValidators[fieldName];
    }

    // Based on Type
    let value = instanceData[fieldName];
    let toReturn: React.ReactNode = null;
    if (customWidgets[fieldName]) {
      // If user have provided a custom widget for this type, the use that
      const C = customWidgets[fieldName];
      //@ts-ignore
      toReturn = <C />;
    } else if (kind === 'SCALAR') {
      toReturn = scalarFieldToInput(field, mapping, foreignKeys, value);

    } else if (kind === 'ENUM') {
      if (typeName) {
        // @ts-ignore
        toReturn = <EnumInput enumType={typeName} />
      }
    }
    return <InputWrapper {...fieldProps} key={fieldName}>
      {toReturn}
    </InputWrapper>;

  });
}

export const inputFieldKind = (
  field: patchTypeQuery___type_inputFields
): patchTypeQuery___type_inputFields_type_ofType | null => {
  const { type } = field;
  const info = type.kind === 'NON_NULL' ? type.ofType : type;
  return info;
}
const scalarFieldToInput = (f: patchTypeQuery___type_inputFields, mapping: any, foreignKeys: { [x: string]: string } = {}, value: any): React.ReactNode => {
  const { name: fieldName } = f;
  const info = inputFieldKind(f);
  if (!info) return null;
  const { name: typeName } = info;
  if (handlableTypeName(typeName)) {
    // It could be a foreign Key, so we do some guess here
    if (mapping[fieldName]) {
      // @ts-ignore
      return <HasOneInput {...mapping[fieldName]} />
    } else if (foreignKeys[fieldName]) {
      // It is a foreign key by the fooByBarId pattern. 
      return <NumberInput />
    } else {
      const C = nameToFormFieldMapping[typeName];
      switch (typeName) {
        case 'Date':
        case 'Datetime': {
          value = value ? moment(value) : null;
        }
      }
      // @ts-ignore
      // The component here should not pass in any parameters
      // Even though they require a non null value, onChange
      // Because the getFieldDecorator() in form will provide it
      return <C />;
    }
  } else {
    // If it's not known, but still a scalar, then use a text input
    return <TextInput />;
  }
}