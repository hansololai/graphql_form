import * as React from 'react';
import { DatePicker, Input, Form, Button } from 'antd';
import { Moment } from 'moment';
import 'antd/lib/date-picker/style'
import 'antd/lib/input/style'
import 'antd/lib/form/style'
import 'antd/lib/button/style'

const { RangePicker } = DatePicker;

const { Item: FormItem } = Form;

export interface SearchDropdownProps {
  name: string;
  field: string;
  error?: string;
  searchText: string | [Moment];
  onInputChange: (v: any, f: string, searchOnClose?: boolean) => void;
  onCloseSearch: (f: string) => void;
  searchType: string;
}
export class SearchDropdown extends React.Component<SearchDropdownProps> {
  constructor(props) {
    super(props);
    this.getInput = this.getInput.bind(this);
  }
  searchInput: any = null;
  getInput() {
    return this.searchInput;
  }
  render() {
    const {
      name,
      field,
      error,
      searchText,
      onInputChange,
      onCloseSearch,
      searchType = 'String',
    } = this.props;
    let inputField: React.ReactNode = null;
    switch (searchType) {
      case 'String':
        if (typeof searchText === 'string' || !searchText)
          inputField = (<Input
            ref={(input) => { this.searchInput = input; }}
            autoFocus
            placeholder={`Search ${name}`}
            value={searchText}
            onChange={e => onInputChange(e.target.value, field)}
            onPressEnter={() => onCloseSearch(field)}
          />);
        break;
      case 'Date':
      case 'Datetime':
        inputField = (<RangePicker
          showTime={searchType === 'Datetime'}
          ref={(input) => { this.searchInput = input; }}
          onChange={dates => onInputChange(dates, field, true)}
          // onPressEnter={() => onCloseSearch(field)}
          value={searchText as [Moment]}
          onOk={() => onCloseSearch(field)}
        />);
    }

    return (
      <div style={{ padding: 8, borderRadius: 6, background: '#fff', boxShadow: '0 1 6' }}>
        <FormItem
          style={{ display: 'inline-block' }}
          validateStatus={error ? 'error' : undefined}
          help={error ? `No ${name} found.` : null}
        >
          {inputField}
        </FormItem>
        {searchType === 'String' && <Button type="primary" onClick={() => onCloseSearch(field)} style={{ marginTop: 3 }}>Close</Button>}
      </div>);
  }
}
