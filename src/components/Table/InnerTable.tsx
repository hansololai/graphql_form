import * as React from 'react';
import * as moment from 'moment';
import * as debounce from 'lodash.debounce';
import { notification, Icon, Button, Row, Col, Select, Form, message, Table } from 'antd';
import * as changeCase from 'change-case';
import * as pluralize from 'pluralize';
import { Query, Subscription } from 'react-apollo';
import { ColumnProps, TableProps } from 'antd/lib/table'
import { fieldTypeQuery___type_fields } from 'components/Form/__generated__/fieldTypeQuery';

const { Option } = Select;
const { Item: FormItem } = Form;

/**
 * @class InnerTable creates a table from given schema
 * and displays a collection of a particular model
 * @description It create fields for all SCALAR field type of a model,
 * does not handle associated model yet.
 * for each scalar types, it allows server sorting.
 * For String, Int, it create search dropdown to type in text and search in server.
 * for Date, it create Range picker to search in server.
 * It also has server pagination function. The data are cached using apollo client.
 * so fetched pages is saved in cache and click back to that page will not trigger refetch.
 * @param {String} modelName the name of the model
 * @param {Object} condition the condition to select the collection
 * @param {Object} filter the filter (similar to condition,
 * but using the postgraphile filter plugin)
 * Note the filter and conditions are the preset variables,
 * they will not be overwritten if they are passed in from higher component
 * @param {Array} fields the array of fields that is the output of a graphQL __type query.
 * @param {Object} customQuery To display the data throuch customized
 * query instead of the constructed query, pass in the query.
 * To correspond to the customQuery, a displayField parameter
 * will also be required because the customQuery may be querying for subset of fields.
 * @param {String}  mode server|client
 * @param {Object} registry, in which keys are the Type defined in GraphQL,
 * such as Location, LocationsConnection, the value consist of modification of the column
 * This is a prefered way to modify the column, because the registration is mainly
 * handling OBJECT data in the field. The renderer are usually from shared component.
 * Currently registry is an object with a render function, and also a filter function.
 * The filter function takes a text input (the user text input), and a variable object
 * The return object of the filter should also be a variable object.
 * This variable is then passed into graphQL <Query> object from react-apollo
 * @example Using a global registry to handle display of common object types,
 * such as Location/Account/User/ etc, and creating component that handles displaying of each model
 * registry = {
 *  User: { render: <UserComponent/>}
 *  Location: { render: <LocationComponent/>}
 * }
 * Then this registry can apply to many other tables
 *
 * @param {Object} searchText A object that contains the default searchs on each fields.
 * The key in this object should be the graphQL field name of this model.
 * The value is recommended to be array of text (currently only size 1 if it's search bar).
 * For example, for User model, most of the fields are searched by text,
 * except for Date, DateTime field. For these columns,
 * the searchText is an array of 2 moment objects.
 * representing the start and end date/time.
 * @param {Array<String>} displayFields An array of text,
 * each represent the field to be queried from graphQL server. If not
 * provided, then all fields are queried from the server.
 * Including the One-to-One associations of the model.
 * @param {Object} andConfig The config object to be send to Antd table.
 * This is send to Antd Table last, so it will override other params if they
 * have the same key
 * @param {String} orderBy The default order of the table.
 * Must be in postgraphile format. e.g. "PRIMARY_KEY_ASC"
 * @param {Array<String>} columnOrder An Array of String describing the order of the columns.
 * Each string should be the keys of the columns,
 * (The keys are usually the field name (if it is auto generated column)
 * or the key specified in extended columns)
 * @param {Boolean} hideRefresh The table provide an refresh button to
 * refetch the data if there are data in the server is updated but the client is
 * outdated. This option will hide the button
 * @param {Object} pagination The pagination object. see more in [antd](https://ant.design/components/pagination/)
 * @param {Array<Object>} extendedColumns An array of columns that's extra.
 * This is another way to modify the columns of the table. The added column
 * can have the same key as the auto generated columns, in which case
 * it will be merged with the extendedColumn override the auto generated column.
 * Unlike the antd render function, the render function in extendedCoumns will
 * be exposed the parameters in Apollo Query API. such as fetchMore, refetch, variables, etc...
 * https://www.apollographql.com/docs/react/essentials/queries.html#render-prop.
 * This is for the purpose of render action buttons in
 * extended columns. If clicking these action buttons will modify
 * the data and requires refetching, this setup allows it.
 * @param {Array<String>} checkboxFilterColumns An array of column keys that,
 * instead of rendering the search bar, renders a drop down with multiple selections.
 * The selections are all the distinct values of that field in the table.
 * @param {Array<String>} hiddenColumns An array of columns keys that
 * indicates the columns generated should be hidden.
 * @param {Object} extendedFields An object of key-value pairs,
 * where key represent the field name in GraphQL query, and the value is
 * to replace that field with. A classic example is to replace
 * a has-one association, with more nested text. For example
 * the generated query for 'Location' has a field 'accountByAccountId',
 * by default the query will only get the account id, and name, but
 * one can extend it with {accountByAccountId:`accountByAccountId{id,name,createdAt,hasBill,hot}`}
 * @param {Boolean} allowSelectColumns A boolean indicate a Select to be displayed at the top of the table, which user can select the columns to be hidden, and/or unhidden
 * @param {Boolean} enableExport A boolean that indicates the display of the export button
 * @param {Boolean} live A boolean indicate to show notification when new record is created, or record is deleted.
 * which user can select the columns to be hidden, and/or unhidden
 *
 */
export interface GraphqlTableColumProps<T> extends ColumnProps<T> {
  fragment: Document;
}

export interface InnerTableProps<T> extends TableProps<T> {
  columns: GraphqlTableColumProps<T>[];
  modelName: string;
  fields: fieldTypeQuery___type_fields[];
}


export class InnerTable<T> extends React.Component<InnerTableProps<T>> {
  constructor(props) {
    super(props);
    this.state = {
      searchText: props.searchText || {},
      filterDropdownVisible: {},
      downloading: false,
      variables: {
        filter: {},
        offset: 0,
      },
      columnsToHide: props.hiddenColumns,
      selectedRowKeys: [],
      selectAllLoading: false,
    };
    this.onCloseSearch = this.onCloseSearch.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.onChangeTable = this.onChangeTable.bind(this);
    this.onHideColumns = this.onHideColumns.bind(this);
    this.onFilterDropdownVisibleChange = this.onFilterDropdownVisibleChange.bind(this);
    this.calculateNewVariable = this.calculateNewVariable.bind(this);
    this.generateOneColumn = this.generateOneColumn.bind(this);
    this.generateColumnFromQL = this.generateColumnFromQL.bind(this);
    this.exportCsv = this.exportCsv.bind(this);
    this.selectAll = this.selectAll.bind(this);
  }
  debounceSearch = debounce(() => {
    this.onSearch();
  }, 500);


  onHideColumns(value) {
    this.setState({ columnsToHide: value });
  }

  onCloseSearch(key) {
    this.onFilterDropdownVisibleChange(key, false);
  }

  onInputChange(value, key, searchOnType = false) {
    const { searchText } = this.state;
    const newSearchText = { ...searchText, [key]: value };
    const callback = searchOnType ? this.onSearch : this.debounceSearch;
    // This callback is usually debouceSearch(), for user typing in search box
    // But in case some other fields that are not text input, such as date range select,
    // pass in onSearch directly, so it searches right after setState
    this.setState({ searchText: newSearchText, resetOffset: true }, callback);
  }

  onSearch() {
    const newVariables = this.calculateNewVariable();
    this.setState({ variables: newVariables });
  }

  onChangeTable(pagination, filters, sorter) {
    const { searchText } = this.state;
    const variables = this.baseVariable();
    // Generate variable for pagination
    const { current, pageSize } = pagination;
    const { offset: oldOffset, orderBy: oldOrder } = variables;
    const newOffset = (current - 1) * pageSize;
    if (oldOffset !== newOffset) {
      // User clicked pagination. You should only be able to do one action at a time
      const newVariable = { ...variables, offset: newOffset };
      this.setState({ variables: newVariable });
      return;
    }
    // Generate variable for sort
    const { field, order, column = {} } = sorter;
    if (column.sortFunction) {
      // This means it's a extended column, with a defined sort function,
      // so use that instead, do not auto-define orderBy
      const { changed, variables: newVariables } = column.sortFunction(order, variables) || {};
      if (changed) {
        this.setState({ variables: newVariables });
        return;
      }
    } else {
      const newOrder = toGraphQLOrder(field, order);
      if (newOrder !== oldOrder && (newOrder || oldOrder)) { // Canot be both are null/undefined
        const newVariable = { ...variables, orderBy: newOrder };
        if (!newOrder) {
          delete newVariable.orderBy;
        }
        this.setState({ variables: newVariable });
        return;
      }
    }
    // Generate variable for filter
    const newSearchText = { ...searchText };
    let newSearch = false;
    let delaySearch = false;
    Object.entries(filters).forEach(([columnKey, selectedValues]) => {
      // Usually this is an array, in which the column should be included in the array.
      newSearch = true;
      newSearchText[columnKey] = selectedValues;
      if (typeof (selectedValues) === 'string') {
        delaySearch = true;
      }
    });
    if (newSearch) {
      const callback = delaySearch ? this.debounceSearch : this.onSearch;
      this.setState({ searchText: newSearchText, resetOffset: true }, callback);
    } else {
      this.setState({ searchText: newSearchText });
    }
  }

  onFilterDropdownVisibleChange(key, visible) {
    const { filterDropdownVisible } = this.state;
    if (visible) {
      this.setState({ filterDropdownVisible: { ...filterDropdownVisible, [key]: visible } }, () => {
        if (this.searchDropdown) {
          this.searchDropdown.getInput().focus();
        }
      });
    } else {
      this.setState({ filterDropdownVisible: { ...filterDropdownVisible, [key]: visible } });
    }
  }

  calculateNewVariable() {
    const { fields, registry, extendedColumns } = this.props;
    const { searchText, variables, resetOffset = false } = this.state;
    const { filter: f } = variables;
    let customVariables = { filter: { ...f } }; // Make a copy of current filters
    Object.entries(searchText).forEach(([name, value]) => {
      // Find if there's a field with this name
      const field = fields.find(f => f.name === name);
      const { filter } = customVariables;
      // Priority:
      // 1. If customer defined filter, use that first
      // 2. If it's field type is known, use generated filter
      const col = extendedColumns.find(c => c.key === name);
      if (isFunction((col || {}).filter)) {
        customVariables = col.filter(value, customVariables);
      } else if (field) {
        const info = getFieldType(field);
        const { name: typeName, kind } = info;
        if (kind === 'SCALAR') {
          switch (typeName) {
            case 'String':
              if (Array.isArray(value)) {
                if (value.length > 0) {
                  filter[name] = { in: value };
                } else {
                  delete filter[name];
                }
              } else if (value) {
                filter[name] = { includesInsensitive: value };
              } else {
                delete filter[name];
              }
              break;
            case 'ID':
            case 'Int':
            case 'BigInt':
              if (Array.isArray(value)) {
                if (value.length > 0) {
                  filter[name] = { in: value };
                } else {
                  delete filter[name];
                }
              } else if (value) {
                filter[name] = { equalTo: value };
              } else {
                delete filter[name];
              }
              break;
            case 'BigFloat':
            case 'Float':
              if (Array.isArray(value) && value.length === 2) {
                filter[name] = {
                  greaterThanOrEqualTo: value[0],
                  lessThanOrEqualTo: value[1],
                };
              } else if (value) {
                filter[name] = {
                  greaterThanOrEqualTo: Number(value) - 1,
                  lessThanOrEqualTo: Number(value) + 1,
                };
              } else {
                delete filter[name];
              }
              break;
            case 'Datetime':
            case 'Date':
              // This is a range
              if (Array.isArray(value) && value.length === 2) {
                filter[name] = {
                  greaterThanOrEqualTo: value[0].format('YYYY-MM-DD'),
                  lessThanOrEqualTo: value[1].format('YYYY-MM-DD'),
                };
              } else {
                delete filter[name];
              }
              break;
            default:
          }
        } else if (kind === 'OBJECT' && !typeName.includes('Connection')) {
          // It's a has_one relationship
          const filterFunc = dig([typeName, 'filter'], registry);
          if (isFunction(filterFunc)) {
            customVariables = registry[typeName].filter(value, customVariables, name);
          } else if (name.includes('By')) {
            // It is a number, and the field is a regular auto-generated field
            const [, keyname] = name.split('By');
            const camelKeyName = changeCase.camelCase(keyname);
            if (Array.isArray(value)) {
              if (value.length > 0) {
                filter[camelKeyName] = { in: value };
              } else {
                delete filter[camelKeyName];
              }
            } else if (value) {
              filter[camelKeyName] = { equalTo: value };
            } else {
              delete filter[camelKeyName];
            }
          }
        }
      }
    });
    //

    const newVariables = {
      ...variables,
      ...customVariables,
    };
    if (resetOffset) {
      newVariables.offset = 0;
    }
    return newVariables;
  }

  generateOneColumn({ name, displayName, sortable, filterable, searchType = 'text' }) {
    const {
      searchText,
      filterDropdownVisible,
      filterOptions: {
        [name]: checkBoxes = [],
      } = {},
    } = this.state;

    const dropdownProps = {
      name: displayName,
      field: name,
      searchText: searchText[name],
      onInputChange: this.onInputChange,
      onCloseSearch: this.onCloseSearch,
    };

    const preColumn = {
      key: name,
      title: displayName,
      dataIndex: name,
      sorter: sortable,
    };

    let hasFilter = false;
    if (checkBoxes.length > 0) {
      // Uses the native filter,
      preColumn.filters = checkBoxes;
      hasFilter = true;
    } else if (filterable) {
      preColumn.filterIcon = (
        <Icon
          type="search"
          style={{ color: searchText[name] ? '#108ee9' : '#aaa' }}
        />
      );

      preColumn.filterDropdown = (
        <SearchDropdown
          ref={(input) => { this.searchDropdown = input; }}
          {...dropdownProps}
          searchType={searchType}
          searchOnType={searchType !== 'text'}
        />
      );

      preColumn.filterDropdownVisible = !!filterDropdownVisible[name];

      preColumn.onFilterDropdownVisibleChange = visible =>
        this.onFilterDropdownVisibleChange(name, visible);

      hasFilter = true;
    }

    if (hasFilter) {
      if (Array.isArray(searchText[name]) && searchText[name].length === 0) {
        // If empty column, no filteredValue
        preColumn.filteredValue = null;
      } else if (searchText[name] !== '') {
        // If there's text, then there is filtered value
        preColumn.filteredValue = searchText[name];
      } else {
        preColumn.filteredValue = null;
      }
    }

    return { ...preColumn };
  }

  generateColumnFromQL(fields) {
    const { registry = {} } = this.props;
    return fields.map((field) => {
      const { name } = field;
      const info = getFieldType(field);
      const { kind, name: typeName } = info;
      const displayName = getFieldDisplayName(field);

      if (kind === 'SCALAR') {
        switch (typeName) {
          case 'Boolean': {
            const preColumn = this.generateOneColumn({
              name,
              displayName,
              sortable: true,
              filterable: false,
            });
            preColumn.render = (value) => {
              if (value === true) {
                return <Icon type="check-circle" style={{ color: 'green' }} />;
              } else if (value === false) {
                return <Icon type="close-circle" style={{ color: 'red' }} />;
              }
              return null;
            };
            return preColumn;
          }
          case 'ID':
          case 'Int':
          case 'Float':
          case 'BigInt':
          case 'BigFloat':
          case 'String': {
            return this.generateOneColumn({
              name,
              displayName,
              sortable: true,
              filterable: true,
            });
          }
          case 'Datetime':
          case 'Date': {
            const preColumn = this.generateOneColumn({
              name,
              displayName,
              sortable: true,
              filterable: true,
              searchType: 'date',
            });
            preColumn.render = value => (value ? moment(value).format('YYYY-MM-DD') : '');
            return preColumn;
          }
          default: {
            return this.generateOneColumn({
              name,
              displayName,
              sortable: false,
              filterable: false,
            });
          }
        }
      } else {
        // If it is not scalar, then it should be objects,
        // we don't know how to handle it, so look at the registry.
        const { [typeName]: handler } = registry;

        const modelName = changeCase.titleCase(
          pluralize.singular(typeName.replace('Connection', '')),
        ).replace(/ /, '');

        if (handler) {
          // If there is a search handler
          const preColumn = this.generateOneColumn({
            name,
            displayName: handler.title || displayName,
            sortable: false,
            filterable: isFunction(handler.filter),
          });
          if (handler.filter) {
            if (handler.filters) { // Use the native checkbox filter for this column
              preColumn.filters = handler.filters;
              preColumn.filterDropdown = null;
              preColumn.filterIcon = null;
            }
          }
          if (isFunction(handler.render)) {
            // there's a render function for this type, use it!
            preColumn.render = handler.render;
          } else {
            preColumn.render = value => <GraphqlModelDisplay data={value} inline />;
          }
          if (isFunction(handler.toText)) {
            preColumn.toText = handler.toText;
          } else if (MODEL_HASH[modelName]) {
            preColumn.toText = value => (value || {})[MODEL_HASH[modelName].searchfield];
          }
          return preColumn;
        }
        // If not provided then use the GraphqlModelDisplay
        const preColumn = this.generateOneColumn({
          name,
          displayName,
          sortable: false,
          filterable: false,
        });
        preColumn.render = value => <GraphqlModelDisplay data={value} inline />;
        if (MODEL_HASH[modelName]) {
          preColumn.toText = value => (value || {})[MODEL_HASH[modelName].searchfield];
        }
        return preColumn;
      }
    });
  }

  baseVariable() {
    const {
      condition: baseCondition,
      filter,
      variables = {},
      orderBy,
      mode,
      pagination,
    } = this.props;

    const {
      variables: {
        condition: currentCondition = {},
        filter: currentFilter = {},
        customFilter: currentCustomFilter = {},
        ...otherVariables
      },
    } = this.state;

    const { customFilter: baseCustomFilter = {}, filter: baseFilterFromV } = variables;
    const baseFilter = { ...baseFilterFromV, ...filter };
    // If it's client side, then default pagesize is a large number
    let pageSize = mode === 'client' ? 999999 : 20;
    pageSize = pagination.pageSize || pageSize;

    // Smart merge the filter and condition
    // Current setup is base filter cannot be overwritten
    const newCond = { ...currentCondition, ...baseCondition };
    const newFilter = { ...currentFilter, ...baseFilter };
    const newCustomFilter = { ...currentCustomFilter, ...baseCustomFilter };

    return {
      ...variables,
      orderBy,
      offset: 0,
      first: pageSize,
      ...otherVariables,
      condition: newCond,
      filter: newFilter,
      customFilter: newCustomFilter,
    };
  }

  render() {
    const {
      modelName,
      fields,
      mode,
      customQuery,
      displayFields,
      antConfig,
      extendedColumns = [],
      hiddenColumns,
      hideRefresh,
      pagination,
      extendedFields,
      columnOrder,
      allowSelectColumns,
      enableExport,
      live,
      exportable,
      rowSelection,
    } = this.props;

    const {
      downloading = false,
      columnsToHide,
      selectAllLoading = false,
    } = this.state;

    const originalVariables = this.baseVariable();
    const { first: pageSize } = originalVariables;
    let collectionQuery = null;
    let filteredFields = [];
    // Handle conditions based on different input props
    // If there's a list of fields to be displayed, then use that instead of default filtered fields
    if (displayFields) {
      filteredFields = displayFields.map((f) => {
        const toReturn = fields.find(field => field.name === f);
        if (!toReturn) throw Error(`A field ${f} is not found in the model!`);
        return toReturn;
      });
    } else {
      filteredFields = fields.filter(f => defaultFilterHiddenField(f));
    }

    // If there's a custom query, then don't build the collection query, use that instead
    const columnsToFetch = getAllColumns(filteredFields, { hasOne: true });
    if (!customQuery) {
      const pluralModelName = pluralize.plural(modelName);
      const queryField = `all${pluralModelName}`;
      // Get fragments
      // but first filter out the hidden columns
      const fragments = extendedColumns.filter(c => !!c.fragment && !columnsToHide.includes(c.key)).map(c => c.fragment);
      collectionQuery = buildGetCollectionQuery({
        model: modelName,
        fields: columnsToFetch,
        queryName: queryField,
        pageSize,
        extraFields: extendedFields,
        fragments,
        hideFields: columnsToHide,
      });
    } else {
      collectionQuery = customQuery;
    }

    return (
      <Query
        query={collectionQuery}
        variables={originalVariables}
      >
        {({ loading: tableLoading, data: tableData, error: tableError, variables, ...env }) => {
          const { refetch, fetchMore } = env;
          if (tableError) {
            notification.error({
              message: 'Error while fetching data',
              description: tableError.message,
            });
          }
          // Handle conditions based on different input props
          // If it's client side, then default pagesize is a large number
          // If there's a list of fields to be displayed,
          // then use that instead of default filtered fields

          this.exposed = env;
          let autoColumns = [];
          if (!displayFields) {
            autoColumns = this.generateColumnFromQL(
              getAllColumns(filteredFields, { hasOne: true }),
            );
          } else {
            autoColumns = this.generateColumnFromQL(filteredFields);
          }

          // There is extended columns, but they are not exposed to our enviroment,
          // cannot access to fetchMore, refetching, loading, etc.
          // So manually call the render function with these extra stuff
          // Also the extended column may also want to be filterable etc...
          const correctedExtendedColumns = extendedColumns.map((c) => {
            const newC = { ...c };
            if (isFunction(c.render)) {
              const oldFunction = c.render;
              newC.render = (value, record, index) =>
                oldFunction(value, record, index, { ...env, variables });
            }
            // If the column have a filter function, means it can be searched.
            // But if there's a filters, which means it's a drop down checkbox select,
            // then leave it be, antd will handle it
            if (isFunction(c.filter) && !c.filters) {
              const preColumn = this.generateOneColumn({
                name: c.key,
                displayName: c.title,
                sortable: false,
                filterable: true,
              });
              return { ...preColumn, ...newC };
            }
            return newC;
          });

          // Some extended column have the same key, we'll merge these columns
          const columns = autoColumns
            .map((c) => {
              const extend = correctedExtendedColumns.find(ec => ec.key === c.key);
              return extend ? { ...c, ...extend } : c;
            });

          // Then some columns only exist in extendedColumns, add them
          correctedExtendedColumns.forEach((c) => {
            const exist = autoColumns.find(ac => ac.key === c.key);
            if (!exist) columns.push(c);
          });

          // Table data must have only one key, one value, example allLocations: { ...}
          const [, fieldData = {}] = ((Object.entries(tableData) || [])[0] || []);
          const { nodes = [], totalCount = 0 } = fieldData;


          const { offset, orderBy: vorderBy } = variables;
          const current = Math.round(offset / pageSize) + 1;

          // To handler some column has custom defined sortFunction
          // for these, the orderBy will be changed to [], so we have no
          // information on what order the table is listed.
          // so set all auto-generated column to false
          const { field, order } = toTableOrder(vorderBy);
          let columnsWithSort = vorderBy ? (columns.map((column) => {
            if (column.key === field) {
              return { ...column, sortOrder: order };
            }
            if (column.sortOrder) {
              return { ...column, sortOrder: false };
            }
            if (column.setSortOrder) {
              const o = column.setSortOrder(variables);
              if (o) {
                return { ...column, sortOrder: o === 'asc' ? 'ascend' : 'descend' };
              }
              return { ...column, sortOrder: false };
            }
            return column;
          })) : columns;

          const columnKeys = columnsWithSort.map(c => c.key);
          columnOrder.slice().reverse().forEach((co) => {
            const columnIndex = columnKeys.indexOf(co);
            if (columnIndex > 0) {
              const currentKey = columnKeys[columnIndex];
              const currentColumn = columnsWithSort[columnIndex];

              delete columnsWithSort[columnIndex];
              delete columnKeys[columnIndex];

              columnsWithSort.unshift(currentColumn);
              columnKeys.unshift(currentKey);
            }
          });

          columnsWithSort = columnsWithSort.filter(c => !!c);
          // The option of all available columns
          const options = columnsWithSort
            .map(c => <Option key={c.key} value={c.key}>{c.title}</Option>);
          // Now filter these columns, only show the ones user wants to see
          columnsWithSort = columnsWithSort.filter(c => !columnsToHide.includes(c.key));

          if (mode === 'client') {
            return (<AntTable
              {...antConfig}
              columns={columnsWithSort}
              elements={nodes}
            />);
          }
          return (
            <div>
              {allowSelectColumns && (
                <Row>
                  <FormItem label="Hide Columns">
                    <Select
                      style={{ width: '100%' }}
                      onChange={this.onHideColumns}
                      defaultValue={hiddenColumns}
                      mode="multiple"
                      value={columnsToHide}
                    >
                      {options}
                    </Select>
                  </FormItem>
                </Row>
              )}

              {!hideRefresh && (
                <Button
                  onClick={refetch}
                >
                  Refresh Data
                </Button>
              )}

              {live && (
                <Row>
                  <Subscription
                    subscription={buildSubscribeOneQuery({ model: modelName, fields: ['id'], action: 'add' })}
                    variables={{}}
                  >
                    {({ data, loading }) => {
                      if (!data || loading) return null;
                      const camelModelName = changeCase.camelCase(modelName);
                      const { [`${camelModelName}Added`]: addedData = {} } = data;
                      notification.info({
                        message: `${modelName} Created`,
                        description: `A ${modelName} with id ${addedData.id} was just created. You might want to refresh this table if it affects you`,
                      });
                      return null;
                    }}
                  </Subscription>
                  <Subscription
                    subscription={buildSubscribeOneQuery({ model: modelName, fields: ['id'], action: 'remove' })}
                    variables={{}}
                  >
                    {({ data, loading }) => {
                      if (!data || loading) return null;
                      const camelModelName = changeCase.camelCase(modelName);
                      const { [`${camelModelName}Removed`]: removedData = {} } = data;
                      notification.info({
                        message: `${modelName} Removed`,
                        description: `A ${modelName} with id ${removedData.id} was just removed. You might want to refresh this table if it affects you`,
                      });
                      return null;
                    }}
                  </Subscription>
                </Row>
              )}

              {exportable && <Button
                style={{ zIndex: 1, marginTop: 15, float: 'right' }}
                loading={downloading}
                onClick={() => this.exportCsv({
                  refetch,
                  fetchMore,
                  variables,
                  columns: columnsWithSort,
                })}
              >
                Export
              </Button>}

              <AntTable
                {...antConfig}
                elements={nodes}
                columns={columnsWithSort}
                onChange={this.onChangeTable}
                pagination={{
                  position: pagination.position || 'both',
                  total: totalCount,
                  pageSize,
                  current,
                  showTotal: pagination.showTotal ?
                    pagination.showTotal :
                    total => `Total ${total} items`,
                  size: pagination.size,
                }}
                loading={tableLoading || selectAllLoading}
                rowSelection={(rowSelection === null) ? null : {
                  selectedRowKeys: this.state.selectedRowKeys,
                  onChange: (selectedRowKeys) => {
                    if (rowSelection.onChange) {
                      rowSelection.onChange(selectedRowKeys);
                    }
                    this.setState({ selectedRowKeys });
                  },
                  hideDefaultSelections: rowSelection.hideDefaultSelections || true,
                  selections: rowSelection.selections || [{
                    key: 'select-all',
                    text: 'Select All',
                    onSelect: () => this.selectAll({
                      rowKeyName: rowSelection.rowKeyName || 'id',
                      variables,
                    }),
                  }, {
                    key: 'unselect-all',
                    text: 'Unselect All',
                    onSelect: () => {
                      if (rowSelection.onChange) {
                        rowSelection.onChange([]);
                      }
                      this.setState({ selectedRowKeys: [] });
                    },
                  }],
                }}
              />
            </div>
          );
        }}
      </Query>
    );
  }
}
InnerTable.propTypes = {
  searchText: PropTypes.object,
  modelName: PropTypes.string.isRequired,
  condition: PropTypes.object,
  filter: PropTypes.object,
  fields: PropTypes.array,
  customQuery: PropTypes.object,
  mode: PropTypes.string,
  displayFields: PropTypes.array,
  registry: PropTypes.object,
  antConfig: PropTypes.object,
  extendedColumns: PropTypes.array,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  pagination: PropTypes.object,
  hideRefresh: PropTypes.bool,
  orderBy: PropTypes.string,
  checkboxFilterColumns: PropTypes.array,
  client: PropTypes.object.isRequired,
  extendedFields: PropTypes.object,
  columnOrder: PropTypes.array,
  variables: PropTypes.object,
  allowSelectColumns: PropTypes.bool,
  enableExport: PropTypes.bool,
  live: PropTypes.bool,
  exportable: PropTypes.bool,
  rowSelection: PropTypes.object,
};
InnerTable.defaultProps = {
  searchText: {},
  condition: {},
  filter: {},
  fields: [],
  customQuery: null,
  mode: 'server',
  displayFields: null,
  registry: {},
  antConfig: {
    size: 'small',
  },
  orderBy: undefined,
  extendedColumns: [],
  hiddenColumns: [],
  columnOrder: [],
  hideRefresh: true,
  pagination: {},
  checkboxFilterColumns: [],
  extendedFields: {},
  variables: {},
  allowSelectColumns: false,
  enableExport: undefined,
  live: false,
  exportable: true,
  rowSelection: null,
};

export default InnerTable;
