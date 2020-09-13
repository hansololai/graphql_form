  /* eslint-disable react/jsx-props-no-spreading */
import { FormInstance } from 'antd/lib/form/Form';
import * as React from 'react';
import { useQuery, QueryHookOptions } from '@apollo/react-hooks';
import { notification, Form } from 'antd';
import changeCase from 'change-case';
import { DocumentNode } from 'graphql';
import { OperationVariables } from 'apollo-client';
import { Rule } from 'antd/lib/form';
import { patchTypeQuery___type_inputFields, patchTypeQuery___type_inputFields_type_ofType } from './__generated__/patchTypeQuery';
import {
 BooleanInput, TextInput, NumberInput, DateInput, TimeInput, EnumInput,
} from './widgets/index';
import { FormFieldOptionProps, WidgetProp } from './GraphqlForm';

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
const scalarFieldToInput = <T extends object>(f: patchTypeQuery___type_inputFields,
  props: WidgetProp<T>): React.ReactNode => {
  // These scalar fields that come out of box do not need to pass in form.
  const { form, ...others } = props;
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
    // The component here should not pass in value, onChange parameters
    // Even though they require a non null value, onChange
    // Because the getFieldDecorator() in form will provide it
    return <C {...others} />;
  }
  // If it's not known, but still a scalar, then use a text input
  return <TextInput {...others} />;
};

export interface CreateFormFieldsProps<T> extends FormFieldOptionProps<T> {
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
    customRules = {}, customValidators = {}, customWidgets = {}, extraProps = {},
    customWidgetFunc,
  } = props;

  return inputFields.map((field) => {
    const { name: fieldName, type: { kind: firstKind } } = field;
    // Sometimes it's not null,  then have to go one level deeper
    const info = inputFieldKind(field);
    if (!info) return null;

    const { kind, name: typeName } = info;

    const labelName = changeCase.titleCase(fieldName);
    // Here we try to create the Form Item for this field. Have to check the type, and add extra fields etc.

    const rules: Rule[] = [];
    // Here check for some override settings for the item props
    const itemProps = {
      name: fieldName,
      label: labelName,
      ...(customDecorators[fieldName] || {}),
      rules: [...(customRules[fieldName] || [])],
    };

    if (customValidators[fieldName]) {
      const validator = customValidators[fieldName];
      itemProps.rules.push({
        validator: (ruleV, valueV, cbV) => {
          validator(ruleV, valueV, cbV, form);
        },
      });
    }
    // Sometimes the field is not null, but it has default value set in backend
    // so they don't need to be required, but front end have no way to know that.
    // It will need to be manually set in the customDecorators.
    // so we only do the "guessing" when the "required" is undefined
    // or it is set to true
    const isRequired = itemProps.required;
    if ((isRequired === undefined && firstKind === 'NON_NULL') || isRequired) {
      // Unless this field can be auto generated, like "id"
      if (!['id', 'createdAt', 'updatedAt'].includes(fieldName)) {
        rules.push({ required: true });
      }
      itemProps.required = true;
    }
    // Same idea for hidden. By default hide the id
    const isHidden = itemProps.hidden;
    if (isHidden === undefined && fieldName === 'id') {
      itemProps.hidden = true;
    }

    // Based on Type
    let toReturn: React.ReactNode = customWidgetFunc ? customWidgetFunc(field) : null;
    const inputProp = { ...(extraProps[fieldName] || {}) };
    if (!toReturn) {
       if (customWidgets[fieldName]) {
        // If user have provided a custom widget for this type, the use that
        const C = customWidgets[fieldName];
        toReturn = <C form={form} {...inputProp} />;
      } else if (kind === 'SCALAR') {
        toReturn = scalarFieldToInput(field, inputProp);
      } else if (kind === 'ENUM') {
        if (typeName) {
          toReturn = <EnumInput enumType={typeName} form={form} {...inputProp} />;
        }
      }
    }

    // If non match, it means the Input Component is just null, it also works
    // with hidden Form.Item. The data is saved in form, but there is no input dom
    // for it
    return (
      <Form.Item
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        {...itemProps}
        key={fieldName}
      >
        {toReturn}
      </Form.Item>
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
