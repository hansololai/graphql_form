import * as React from 'react';
import { Form, Input } from 'antd';
import {  FormItemProps, Rule, FormInstance } from 'antd/lib/form'
import * as  changeCase from 'change-case';
import { patchTypeQuery___type_inputFields_type } from './__generated__/patchTypeQuery';


const { Item } = Form;
export type validatorFunc = <T extends object>(rule: any, value: any, callback: any,form?: FormInstance<T>) => any;
export interface InputWrapperProps<FormData> {
  form: FormInstance<FormData>
  name: string;
  type: patchTypeQuery___type_inputFields_type;
  value?: any;
  disabled: boolean;
  hidden: boolean;
  options?: FormItemProps;
  customRules?: Rule[];
  validator?: validatorFunc;
}
const setupDecorator = <T extends object>(props: InputWrapperProps<T>): FormItemProps=> {
  const {
    form,
    name,
    type: { kind },
    value,
    options = {},
    customRules = [],
    validator } = props;
  const decorator = { ...options, rules: [...customRules], initialValue: value };
  if (kind === 'NON_NULL') {
    // Unless this field can be auto generated, like "id"
    if (!['id', 'createdAt', 'updatedAt'].includes(name)) {
      decorator.rules.push({ required: true });
    }
  }
  if (validator) {
    decorator.rules.push({ validator:(ruleV, valueV, cbV)=>{
      validator(ruleV, valueV, cbV, form);
    }
    });
  }
  return decorator;
}

export const InputWrapper: React.SFC<InputWrapperProps<FormData>> = (props) => {
  const {
    name,
    disabled,
    hidden,
  } = props;
  const decorator = setupDecorator(props);

  const fieldName = changeCase.titleCase(name);
  // If it should not show

  if (name === 'id' || hidden) {
    // ID field is special, it should be hidden, it is NOT NULL, but it could be NULL (for create)
    return <Item hidden>
      <Input disabled type="hidden" />
    </Item>

  }
  // Set disable if necessary
  const children = React.Children.map(props.children, (child) => {
    const childProp = { disabled };
    return React.cloneElement(child as React.ReactElement<any>, childProp);
  });

  // The children must be a single element, the FormItem will modify the props by
  // passing in a value, and a "onChange". 
  return (<Item name={name} label={fieldName} {...decorator}>
    {children ? children[0]:null}
  </Item>);
};