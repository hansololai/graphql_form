import * as React from 'react';
import { Form, Input } from 'antd';
import { FormItemProps, Rule, FormInstance } from 'antd/lib/form';
import * as changeCase from 'change-case';
import { patchTypeQuery___type_inputFields_type } from './__generated__/patchTypeQuery';

const { Item } = Form;
export type ValidatorFunc = <T extends unknown>(rule: any, value: any,
  callback: any, form?: FormInstance<T>) => any;
export interface InputWrapperProps<T> {
  form: FormInstance<T>
  name: string;
  type: patchTypeQuery___type_inputFields_type;
  value?: any;
  disabled: boolean;
  hidden: boolean;
  options?: FormItemProps;
  customRules?: Rule[];
  validator?: ValidatorFunc;
}
const setupDecorator = <T extends unknown>(props: InputWrapperProps<T>): FormItemProps => {
  const {
    form,
    name,
    type: { kind },
    value,
    options = {},
    customRules = [],
    validator,
} = props;
  const decorator = { ...options, rules: [...customRules], initialValue: value };
  if (kind === 'NON_NULL') {
    // Unless this field can be auto generated, like "id"
    if (!['id', 'createdAt', 'updatedAt'].includes(name)) {
      decorator.rules.push({ required: true });
    }
  }
  if (validator) {
    decorator.rules.push({
 validator: (ruleV, valueV, cbV) => {
      validator(ruleV, valueV, cbV, form);
    },
    });
  }
  return decorator;
};

/**
 * @description Wrapper for the form fields, basically wrap around the component with Form.Item
 */
export const InputWrapper = <T extends unknown>(
  props: React.PropsWithChildren<InputWrapperProps<T>>) => {
  const { children: oldChildren, ...noChildrenProp } = props;
   const {
    name,
    disabled,
    hidden,
  } = noChildrenProp;
  const decorator = setupDecorator(noChildrenProp as InputWrapperProps<T>);

  const fieldName = changeCase.titleCase(name);
  // If it should not show

  if (name === 'id' || hidden) {
    // ID field is special, it should be hidden, it is NOT NULL, but it could be NULL (for create)
    return (
      <Item hidden>
        <Input disabled type="hidden" />
      </Item>
);
  }
  // Set disable if necessary
  const children = React.Children.map(oldChildren, (child) => {
    const childProp = { disabled };
    return React.cloneElement(child as React.ReactElement<any>, childProp);
  });

  // The children must be a single element, the FormItem will modify the props by
  // passing in a value, and a "onChange".
  return (
    <Item
      name={name}
      label={fieldName}
      /* eslint-disable-next-line react/jsx-props-no-spreading */
      {...decorator}
    >
      {children ? children[0] : null}
    </Item>
);
};
