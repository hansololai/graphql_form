import { FormInstance } from 'antd/lib/form/Form';
import * as React from 'react';
import { useQuery, QueryHookOptions } from '@apollo/react-hooks';
import { notification } from 'antd';
import { DocumentNode } from 'graphql';
import { OperationVariables } from 'apollo-client';
import { patchTypeQuery___type_inputFields, patchTypeQuery___type_inputFields_type_ofType } from './__generated__/patchTypeQuery';
import { InputWrapper, InputWrapperProps } from './InputWrapper';
import {
 BooleanInput, TextInput, NumberInput, DateInput, TimeInput, EnumInput,
} from './widgets/index';
import { FormFieldOptionProps } from './GraphqlForm';

/**
 * @description Check if the input is a function
 */
export function isFunction(funcToCheck: any): funcToCheck is Function {
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
};

export type PossibleTypeNames = keyof typeof nameToFormFieldMapping;

/**
 * @description guard to check the input type is handleable, by handlable, we have a
 * widget for the data type. For example, if the type is "String", then we have a Input Component
 * so it is handleable.
 */
export function handlableTypeName(type: string): type is PossibleTypeNames {
  if (['Boolean', 'String', 'Datetime', 'Date', 'Int', 'BigInt', 'Float', 'BigFloat'].includes(type)) {
    return true;
  }
  return false;
}
/**
 * @description return the component for a field
 */
export const inputFieldKind = (
  field: patchTypeQuery___type_inputFields,
): patchTypeQuery___type_inputFields_type_ofType | null => {
  const { type } = field;
  const info = type.kind === 'NON_NULL' ? type.ofType : type;
  return info;
};
const scalarFieldToInput = (f: patchTypeQuery___type_inputFields): React.ReactNode => {
  // const { name: fieldName } = f;
  const info = inputFieldKind(f);
  if (!info) return null;
  const { name: typeName } = info;
  if (typeName && handlableTypeName(typeName)) {
    // It could be a foreign Key, so we do some guess here
    const C = nameToFormFieldMapping[typeName];
    // switch (typeName) {
    //   case 'Date':
    //   case 'Datetime': {
    //     // value = value ? moment(value) : null;
    //   }
    // }
    // @ts-ignore
    // The component here should not pass in any parameters
    // Even though they require a non null value, onChange
    // Because the getFieldDecorator() in form will provide it
    return <C />;
  }
  // If it's not known, but still a scalar, then use a text input
  return <TextInput />;
};

export interface CreateFormFieldsProps<T> extends FormFieldOptionProps {
  form: FormInstance<T>;
  inputFields: patchTypeQuery___type_inputFields[];
}

/**
 * @description Function that given an array of fields, and some customization, generate a list of components to be rendered. in a form
 * The fields are best to be put inside an Antd Form.
 */
export const createFormFields = <TData extends object>(props: CreateFormFieldsProps<TData>) => {
  const {
 inputFields, form, customDecorators = {},
    customRules = {}, customValidators = {}, customWidgets = {},
} = props;
  // fields are going to be used as reference to check if it's a foreign key, let's process it once first

  return inputFields.map((field) => {
    const { name: fieldName, type } = field;
    // Sometimes it's not null,  then have to go one level deeper
    const info = inputFieldKind(field);
    if (!info) return null;

    const { kind, name: typeName } = info;
    // Here we try to create the Form Item for this field. Have to check the type, and add extra fields etc.
    const fieldProps: InputWrapperProps<any> = {
      form,
      name: fieldName,
      type,
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
    let toReturn: React.ReactNode = null;
    if (customWidgets[fieldName]) {
      // If user have provided a custom widget for this type, the use that
      const C = customWidgets[fieldName];
      // @ts-ignore
      toReturn = <C />;
    } else if (kind === 'SCALAR') {
      toReturn = scalarFieldToInput(field);
    } else if (kind === 'ENUM') {
      if (typeName) {
        // @ts-ignore
        toReturn = <EnumInput enumType={typeName} />;
      }
    }
    return (
      <InputWrapper
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...fieldProps}
        key={fieldName}
      >
        {toReturn}
      </InputWrapper>
);
  });
};

/**
 * @description A wrapper on useQuery, it auto pop up a notification if graphql query come back with error.
 */
export const useQueryWithError = <TD, TV=OperationVariables>(query: DocumentNode,
  options?: QueryHookOptions<TD, TV>) => {
  const result = useQuery<TD, TV>(query, options);
  if (result.error) {
    notification.error({
      message: 'Error fetching data',
      description: result.error.message,
    });
  }
  return result;
};
