import * as React from 'react';
import { Form, Input } from 'antd';
import * as changeCase from 'change-case';
import { isFunction } from '../utils';
import { FormComponentProps, GetFieldDecoratorOptions, ValidationRule, ValidateCallback, WrappedFormUtils } from 'antd/lib/form/Form';

export type kindType = "SCALAR" | "OBJECT" | "INTERFACE" | "UNION" | "ENUM" | "INPUT_OBJECT" | "LIST" | "NON_NULL";

export type GraphqlTypeIntrospect = {
  name?: string,
  kind: kindType,
  ofType: GraphqlTypeIntrospect,
  inputFields: any[],
  fields: any[],
}

export type validatorFunctionProps = (rule: any, value: any, callback: any, source?: any, options?: any, form?: WrappedFormUtils<any>) => any;

export interface InputWrapperProps extends FormComponentProps {
  name: string;
  value: string | number | boolean;
  type: GraphqlTypeIntrospect;
  disabled: boolean;
  hidden: boolean;
  options: Partial<GetFieldDecoratorOptions>;
  customRules: ValidationRule[];
  validator: validatorFunctionProps;
  children: React.ReactNode;
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const { Item } = Form;

export const InputWrapper = (props: InputWrapperProps) => {
  const { form: { getFieldDecorator = null } = {},
    form,
    name,
    type: { kind },
    value,
    disabled,
    hidden,
    options = {},
    customRules = [],
    validator } = props;
  const decorator: Partial<GetFieldDecoratorOptions> = { ...options, rules: [...customRules], initialValue: value };
  if (kind === 'NON_NULL') {
    // Unless this field can be auto generated, like "id", otherwise they are required
    // For now don't know how to know if this field has "default value" yet, at least not from graphql introspection
    // have to hard set it
    if (!['id', 'createdAt', 'updatedAt'].includes(name)) {
      decorator.rules.push({ required: true });
    }
  }
  // If there's a validator for this field, put it in rules, but also modify it to pass in the form object
  if (isFunction(validator)) {
    const validate = (ruleV, valueV, cbV, sourceV, optionsV) => {
      validator(ruleV, valueV, cbV, sourceV, optionsV, form);
    };
    decorator.rules.push({ validator: validate });
  }
  const fieldName = changeCase.titleCase(name);

  // Hide this field or not, by defeault we hide "id" field, and also other fields that's marked hidden
  if (name === 'id' || hidden) {
    // ID field is special, it should be hidden, it is NOT NULL, but it could be NULL (for create)
    return getFieldDecorator(name, decorator)(
      <Input disabled type="hidden" />,
    );
  }

  // If no decorator, then just the input
  if (!isFunction(getFieldDecorator)) {
    return <Item {...formItemLayout} label={fieldName}>{props.children}</Item>;
  }

  // Set disable if necessary
  const children = React.Children.map(props.children, (child) => {
    const childProp = { disabled };
    return React.cloneElement(child as React.ReactElement<any>, childProp);
  });
  return (<Item {...formItemLayout} label={fieldName}>
    {getFieldDecorator(name, decorator)(
      children[0],
    )}
  </Item>);
};

