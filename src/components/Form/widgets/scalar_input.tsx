/* eslint-disable react/jsx-props-no-spreading */
import * as React from 'react';
import {
 Checkbox, Input, Select, TimePicker, DatePicker, InputNumber,
} from 'antd';
import { CheckboxProps, CheckboxChangeEvent } from 'antd/lib/checkbox';
import { InputProps, TextAreaProps } from 'antd/lib/input';
import { InputNumberProps } from 'antd/lib/input-number';
import { SelectProps } from 'antd/lib/select';
import { TimePickerProps } from 'antd/lib/time-picker';
import 'antd/lib/input/style';
import 'antd/lib/checkbox/style';
import 'antd/lib/input-number/style';
import 'antd/lib/select/style';
import { DatePickerProps } from 'antd/lib/date-picker';

const { Option } = Select;
const { TextArea } = Input;

export interface BooleanInputProps extends Omit<CheckboxProps, 'onChange'> {
  value?: boolean;
  onChange?: (v:boolean)=>void;
}
export interface TextInputProps extends InputProps { }
export interface NumberInputProps extends InputNumberProps { }
export interface HiddenInputProps extends InputProps { }
export interface TextSelectInputProps extends SelectProps<string> {
  inputOptions: { name: string, value: string }[];
}
export interface TimeInputProps extends TimePickerProps { }
export type DateInputProps = DatePickerProps;
export interface TextAreaInputProps extends TextAreaProps { }

/**
 * @description This file contains multiple input form component using antd form components.
 * The export components handles most scalar values such as boolean, string, number, date, time
 */

/**
 * @description This is a Boolean input, as a checkbox. The prop is "checked", not the default "value".
 * So this does a conversion.
 */
export const BooleanInput: React.FC<BooleanInputProps> = (props) => {
  const { value, onChange: change } = props;
  const onChange = (e: CheckboxChangeEvent) => {
    if (change) {
      change(e.target.checked);
    }
  };
  return <Checkbox {...props} checked={value} onChange={onChange} />;
};

/**
 * @description This function is a regular text input field
 */
export const TextInput: React.FC<TextInputProps> = (props) => <Input {...props} />;

/**
 * @description This sfc is a regular Number input field
 */
export const NumberInput: React.FC<NumberInputProps> = (props) => <InputNumber {...props} />;

/**
 * @description This SFC is a hidden input.
 */
export const HiddenInput: React.FC<HiddenInputProps> = (props) => <Input {...props} hidden />;

/**
 * @description THis SFC is a Text Select Dropdown input. The value used is a string
 */
export const TextSelectInput: React.FC<TextSelectInputProps> = (props) => {
  const { value, onChange, inputOptions = [] } = props;
  const selectOptions = inputOptions.map((o) => {
    const { name, value: optionValue } = o;
    return <Option key={optionValue} value={optionValue} title={name}>{name}</Option>;
  });
  return (
    <Select<string> value={value} onChange={onChange}>
      {selectOptions}
    </Select>
);
};

/**
 * @description Ths SFC is a Time Input, using Antd's Timepicker
 */
export const TimeInput: React.FC<TimeInputProps> = (props) => <TimePicker {...props} />;

/**
 * @description Ths SFC is a Time Input, using Antd's Timepicker
 */
export const DateTimeInput: React.FC<TimeInputProps> = (props) => (
  <DatePicker
    {...props}
    showTime
  />
);

/**
 * @description This  SFC is a DateInput, using Antd's DateInput
 */
export const DateInput: React.FC<DateInputProps> = (props) => <DatePicker {...props} />;
/**
 * @description This SFC is a Text Area Input.
 */
export const TextAreaInput: React.FC<TextAreaInputProps> = (props) => <TextArea {...props} />;
