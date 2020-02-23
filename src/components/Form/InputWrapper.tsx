import * as React from 'react';
import { Form, Input } from 'antd';
import { ValidationRule } from 'antd/lib/form'
import { WrappedFormUtils, GetFieldDecoratorOptions } from 'antd/lib/form/Form'
import * as  changeCase from 'change-case';
import { patchTypeQuery___type_inputFields_type } from './__generated__/patchTypeQuery';
import { formItemLayout } from './InnerForm'


const { Item } = Form;
export type validatorFunc = (rule: any, value: any, callback: any, source?: any, options?: any, form?: WrappedFormUtils) => any;
export interface InputWrapperProps {
  form: WrappedFormUtils;
  name: string;
  type: patchTypeQuery___type_inputFields_type;
  value?: any;
  disabled: boolean;
  hidden: boolean;
  options?: GetFieldDecoratorOptions;
  customRules?: ValidationRule[];
  validator?: validatorFunc;
}
const setupDecorator = (props: InputWrapperProps): GetFieldDecoratorOptions => {
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
  // If there's a validator for this field, put it in rules, but also modify it to pass in the form object
  if (validator) {
    const validate = (ruleV, valueV, cbV, sourceV, optionsV) => {
      validator(ruleV, valueV, cbV, sourceV, optionsV, form);
    };
    decorator.rules.push({ validator: validate });
  }
  return decorator;
}

export const InputWrapper: React.FC<InputWrapperProps> = (props) => {
  const {
    form,
    name,
    disabled,
    hidden,
  } = props;
  const { getFieldDecorator } = form;
  const decorator = setupDecorator(props);

  const fieldName = changeCase.titleCase(name);
  // If it should not show

  if (name === 'id' || hidden) {
    // ID field is special, it should be hidden, it is NOT NULL, but it could be NULL (for create)
    return <div>
      {getFieldDecorator(name, decorator)(
        <Input disabled type="hidden" />
      )}
    </div>

  }
  // Set disable if necessary
  const children = React.Children.map(props.children, (child) => {
    const childProp = { disabled };
    return React.cloneElement(child as React.ReactElement<any>, childProp);
  });

  return (<Item {...formItemLayout} label={fieldName}>
    {getFieldDecorator(name, decorator)(
      children ? children[0] : null
    )}
  </Item>);
};