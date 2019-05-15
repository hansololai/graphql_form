import React from 'react';
import PropTypes from 'prop-types';
import { Select, notification } from 'antd';
import { Query, withApollo } from 'react-apollo';
import debounce from 'lodash.debounce';
import pluralize from 'pluralize';
import InputWrapper from './input_wrapper';
import { displayModelQL, MODELS } from '../../../graphql_queries';
import { isFunction } from '../../../utils';

const { Option } = Select;


class HasOneInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchInput: '',
      asyncFilter: {},
    };
    this.onSearch = this.onSearch.bind(this);
    this.setSearchInput = this.setSearchInput.bind(this);
    this.setFilter = this.setFilter.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.debounceSearch = debounce((text) => {
      this.setSearchInput(text);
    }, 200);
  }
  onFocus() {
    // Do the search only on focus
    this.setState({ focused: true });
    this.setSearchInput('');
  }
  onBlur() {
    this.setState({ focused: false });
  }

  onSearch(e) {
    this.debounceSearch(e);
  }
  setFilter() {
    const { asyncFilter, ...others } = this.props;
    if (isFunction(asyncFilter)) {
      asyncFilter(others).then((filter) => {
        this.setState({ asyncFilter: filter });
      });
    } else if (typeof (asyncFilter) === 'object') {
      this.setState({ asyncFilter });
    }
  }
  setSearchInput(text) {
    this.setFilter();
    this.setState({ searchInput: text });
  }
  render() {
    const { type, query, value, onChange } = this.props;
    const { searchInput, asyncFilter = {}, focused } = this.state;
    const notNull = type.kind === 'NOT_NULL';
    const info = type.kind === 'NON_NULL' ? type.ofType : type;
    const { name: typeName } = info;

    // Predefined fragment to query for models, it can either from props, or just the regular collection query
    const modelQuery = query || displayModelQL[typeName];
    if (!modelQuery) {
      // hmm no query, don't know how to render select if I don't know what field to display in options
      return <Select />;
    }

    const { searchfield } = MODELS.MODEL_HASH[typeName];
    // Set up variables, if there's a value, (which is the id) then it should be in the variables.
    // or if it matches the text in the search field
    const filter = { ...asyncFilter };
    if (focused) {
      // The user is doing a select
      const or = [];
      // if (Object.keys(asyncFilter).length > 0) {
      //   or.push(asyncFilter);
      // }
      if (searchInput) {
        or.push({
          [searchfield]: { includesInsensitive: searchInput },
        });
      }
      if (value) {
        or.push({
          id: { equalTo: Number(value) },
        });
      }
      filter.or = or;
    } else if (value) {
      // The dropdown is hiding, now only show the selected one
      filter.id = { equalTo: Number(value) };
    }
    return (<Query query={modelQuery} variables={{ filter, first: 50 }}>
      {({ loading, data, error }) => {
        if (loading) {
          return (<Select showSearch />);
        }
        if (error) {
          notification.error({
            message: 'error',
            description: error.message,
          });
          return null;
        }
        const pluralName = pluralize.plural(typeName);
        const { nodes } = data[`all${pluralName}`];

        const options = nodes.map(n => <Option value={n.id} key={n.id}>{n.name}</Option>);
        if (!notNull) {
          options.push(<Option value={null} key={'null'}>--</Option>);
        }
        return (
          <Select
            showSearch
            onSearch={this.onSearch}
            onChange={onChange}
            optionFilterProp="children"
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            value={value}
          >
            {options}
          </Select>);
      }}
    </Query>);
  }
}

HasOneInput.propTypes = {
  asyncFilter: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
  type: PropTypes.object.isRequired,
  query: PropTypes.object,
};
HasOneInput.defaultProps = {
  query: null,
  value: undefined,
  asyncFilter: undefined,
};

const HasOneInputWrapper = (props) => {
  const { value: _, ...others } = props;
  return (<InputWrapper {...props}>
    <HasOneInput {...others} />
  </InputWrapper>)
  ;
};
HasOneInputWrapper.propTypes = {
  value: PropTypes.number,
};
HasOneInputWrapper.defaultProps = {
  value: undefined,
};
export default withApollo(HasOneInputWrapper);
