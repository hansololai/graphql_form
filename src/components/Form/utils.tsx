import { patchTypeQuery___type_inputFields } from './__generated__/patchTypeQuery'
import { WrappedFormInternalProps, ValidationRule, GetFieldDecoratorOptions } from 'antd/lib/form/Form'
import { InnerFormProps } from './InnerForm';
import { BooleanInput, TextInput, NumberInput, DateInput, TimeInput } from './widgets/index';
import * as moment from 'moment';
import { InputWrapper, InputWrapperProps, validatorFunc } from './InputWrapper';
import * as React from 'react';
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
export interface createFormFieldsProps extends WrappedFormInternalProps<InnerFormProps>, FormFieldOptionProps {
  fields: patchTypeQuery___type_inputFields[];
  instanceData: object;
}
export const createFormFields: (props: createFormFieldsProps) => React.ReactNode[] = (props) => {
  const { fields, instanceData = {}, form, customDecorators = {}, customRules = {}, customValidators = {}, customWidgets = {} } = props;
  return fields.map(field => {
    const { name: fieldName, type } = field;
    // Sometimes it's not null,  then have to go one level deeper
    const info = type.kind === 'NON_NULL' ? type.ofType : type;
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
      if (handlableTypeName(typeName)) {
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
        toReturn = <C />;
      } else {
        // If it's not known, but still a scalar, then use a text input
        toReturn = <TextInput />;
      }
    }
    return <InputWrapper {...fieldProps} key={fieldName}>
      {toReturn}
    </InputWrapper>;

  });
}