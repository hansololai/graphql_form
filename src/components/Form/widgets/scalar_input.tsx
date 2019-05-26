import * as React from 'react';
import { Checkbox, Input, Select, TimePicker, DatePicker, InputNumber } from 'antd';
import { CheckboxProps } from 'antd/lib/checkbox';
import { InputProps, TextAreaProps } from 'antd/lib/input'
import { InputNumberProps } from 'antd/lib/input-number';
import { SelectProps } from 'antd/lib/select';
import { TimePickerProps } from 'antd/lib/time-picker';
import { DatePickerProps } from 'antd/lib/date-picker/interface';
import 'antd/lib/input/style'
import 'antd/lib/checkbox/style'
import 'antd/lib/input-number/style'
import 'antd/lib/select/style'

const { Option } = Select;
const { TextArea } = Input;

export interface BooleanInputProps extends CheckboxProps {
  value: boolean;
}
export interface TextInputProps extends InputProps { }
export interface NumberInputProps extends InputNumberProps { }
export interface HiddenInputProps extends InputProps { }
export interface TextSelectInputProps extends SelectProps {
  inputOptions: { name: string, value: string }[];
}
export interface TimeInputProps extends TimePickerProps { }
export interface DateInputProps extends DatePickerProps { }
export interface TextAreaInputProps extends TextAreaProps { }


/**
 * @description This file contains multiple input form component using antd form components. 
 * The export components handles most scalar values such as boolean, string, number, date, time 
 */

export const BooleanInput: React.FC<BooleanInputProps> = (props) => {
  const { value } = props;
  return <Checkbox {...props} checked={value} />
};

export const TextInput: React.FC<TextInputProps> = (props) => <Input {...props} />;

export const NumberInput: React.FC<NumberInputProps> = (props) => < InputNumber {...props} />;

export const HiddenInput: React.FC<HiddenInputProps> = (props) => < Input {...props} />;

export const TextSelectInput: React.FC<TextSelectInputProps> = (props) => {
  const { value, onChange, inputOptions = [] } = props;
  const selectOptions = inputOptions.map((o) => {
    const { name, value } = o;
    return <Option key={value} value={value}>{name}</Option>;
  });
  return (<Select value={value} onChange={onChange} >
    {selectOptions}
  </Select>);
};

export const TimeInput: React.FC<TimeInputProps> = (props) => <TimePicker {...props} />;
export const DateInput: React.FC<DateInputProps> = (props) => <DatePicker {...props} />;
export const TextAreaInput: React.FC<TextAreaInputProps> = (props) => <TextArea {...props} />;