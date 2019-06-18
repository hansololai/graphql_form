import * as React from 'react';
import { DatePicker, Input, Form, Button } from 'antd';

const { RangePicker } = DatePicker;

const { Item: FormItem } = Form;

export interface SearchDropdownProps {
  name: string;
  field: string;
  error: string;
  searchText: string;
  onInputChange: (v: any, f: string, onType: boolean) => void;
  onCloseSearch: (f: string) => void;
  searchType: string;
  searchOnType: boolean;
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
      searchType = 'text',
      searchOnType = false,
    } = this.props;
    const inputField = searchType === 'text' ? (<Input
      ref={(input) => { this.searchInput = input; }}
      autoFocus
      placeholder={`Search ${name}`}
      value={searchText}
      onChange={e => onInputChange(e.target.value, field, searchOnType)}
      onPressEnter={() => onCloseSearch(field)}
    />) : (<RangePicker
      ref={(input) => { this.searchInput = input; }}
      onChange={dates => onInputChange(dates, field, searchOnType)}
      // onPressEnter={() => onCloseSearch(field)}
      value={searchText}
    />
      );
    return (
      <div className="custom-filter-dropdown">
        <FormItem
          style={{ display: 'inline-block' }}
          validateStatus={error ? 'error' : undefined}
          help={error ? `No ${name} found.` : null}
        >
          {inputField}
        </FormItem>
        {!searchOnType && <Button type="primary" onClick={() => onCloseSearch(field)} style={{ marginTop: 3 }}>Close</Button>}
      </div>);
  }
}
