import * as React from 'react';
import * as moment from 'moment';
import * as debounce from 'lodash.debounce';
import { notification, Icon, Button, Row, Col, Select, Form, message, Table } from 'antd';
import * as changeCase from 'change-case';
import * as pluralize from 'pluralize';
import { Query, Subscription } from 'react-apollo';
import { ColumnProps, TableProps } from 'antd/lib/table'
import { fieldTypeQuery___type_fields } from 'components/Form/__generated__/fieldTypeQuery';
import { isScalar, buildGetCollectionQuery, getFieldType } from './utils'

const { Option } = Select;
const { Item: FormItem } = Form;

function notNull<T>(value: T | null | undefined): value is T {
  return !!value;
}

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
export interface GraphqlTableColumProps<T> extends Omit<ColumnProps<T>, 'render'> {
  fragment: Document;
  key: string;
  render?: (text: any, record: T, index: number, extra: { variables: any, fetchMore: any, refetch: () => void }) => React.ReactNode;
}

export interface InnerTableProps<T> extends Omit<TableProps<T>, 'columns'> {
  columns: GraphqlTableColumProps<T>[];
  modelName: string;
  fields: fieldTypeQuery___type_fields[];
  hiddenColumns: string[];
}

interface InnerTableState {
  searchText: { [s: string]: string };
  offset: number;
  orderBy: string | [];
  filterDropdownVisible: { [s: string]: boolean };
}

export class InnerTable<T> extends React.Component<InnerTableProps<T>, InnerTableState> {
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
    this.generateColumnsFromFields = this.generateColumnsFromFields.bind(this);
  }
  searchDropdown: any = null;
  exposed: any = null;
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
    const variables = this.baseVariable();
    // Generate variable for pagination
    const { current, pageSize } = pagination;
    const { offset: oldOffset, orderBy: oldOrder } = variables;
    const newOffset = (current - 1) * pageSize;
    if (oldOffset !== newOffset) {
      this.setState({ offset: newOffset });
      return;
    }
    // Generate variable for sort
    const { field, order, column = {} } = sorter;
    const newOrder = toGraphQLOrder(field, order);
    if (newOrder !== oldOrder && (newOrder || oldOrder)) { // Canot be both are null/undefined
      if (!newOrder) {
        this.setState({ orderBy: [] })
      }
      this.setState({ orderBy: newOrder });
      return;
    }
    // Generate variable for filter
    let newSearch = false;

    if (Object.entries(filters).length > 0) {
      newSearch = true;
    }
    if (newSearch) {
      this.setState({ searchText: filters, offset: 0 });
    } else {
      this.setState({ searchText: filters });
    }
  }

  onFilterDropdownVisibleChange(key, visible) {
    const { filterDropdownVisible } = this.state;
    this.setState({ filterDropdownVisible: { ...filterDropdownVisible, [key]: visible } }, () => {
      if (visible) {
        // if (this.searchDropdown) {
        //   this.searchDropdown.getInput().focus();
        // }
      }
    }
  }

  calculateNewVariable() {
    const { fields, registry, extendedColumns } = this.props;
    const { searchText } = this.state;
    const variables = this.baseVariable();
    const { filter = {} } = variables;

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

  generateScalarColumn = (field: fieldTypeQuery___type_fields) => {
    const { searchText } = this.state;
    const typeName = getFieldType(field);
    const { name } = field;
    const preColumn: ColumnProps<T> = {
      key: name,
      title: name,
      dataIndex: name,
      sorter: true,
      render: (value: any, record: T, index: any) => {
        return value;
      }
    };
    switch (typeName) {
      case 'Boolean': {
        preColumn.render = (value) => {
          if (value === true) {
            return <Icon type="check-circle" style={{ color: 'green' }} />;
          } else if (value === false) {
            return <Icon type="close-circle" style={{ color: 'red' }} />;
          }
          return null;
        };
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
        break;
      }
      case 'ID':
      case 'Int':
      case 'Float':
      case 'BigInt':
      case 'BigFloat':
      case 'String': {
        preColumn.render = (value) => {
          return value;
        }
        break;
      }
      case 'Datetime':
      case 'Date': {
        preColumn.render = value => (value ? moment(value).format('YYYY-MM-DD') : '');
        break;
      }
      default: {

      }
    }
    return preColumn;
  }

  generateColumnsFromFields = (fields: fieldTypeQuery___type_fields[]) => {
    return fields.map((field) => {
      if (!isScalar(field)) {
        // Handle non scalar column, TODO
        return null;
      }
      return this.generateScalarColumn(field);
    }).filter(notNull)


  }
  baseVariable = () => {
    const pageSize = 50;
    const { offset, orderBy } = this.state
    return {
      first: pageSize,
      offset,
      orderBy
    }
  }

  render() {
    const {
      modelName,
      fields,
      hiddenColumns,
      columns,
      pagination = false,
    } = this.props;
    const pageSize = 50;

    // First get all Scalar Fields, 
    // Unless there are hidden fields, 
    // these fields will be used for construction graphql query
    const scalarFields = fields.filter(f => isScalar(f) && !hiddenColumns.includes(f.name));
    const fragments = columns.filter(c => !hiddenColumns.includes(c.key)).map(c => c.fragment).filter(f => !!f);



    const collectionQuery = buildGetCollectionQuery({ model: modelName, fields: scalarFields, fragments });

    // Base Variable
    const variable = this.baseVariable();
    return (
      <Query<any>
        query={collectionQuery}
        variables={variable}
      >
        {({ loading: tableLoading, data: tableData, error: tableError, variables, ...env }) => {
          if (tableError) {
            notification.error({
              message: 'Error while fetching data',
              description: tableError.message,
            });
            return null;
          }
          // Handle conditions based on different input props

          this.exposed = env;
          // Now generate columns for each fields

          let autoColumns = this.generateColumnsFromFields(scalarFields);

          // These extra columns, but they are not exposed to our enviroment,
          // cannot access to fetchMore, refetching, loading, etc.
          // So manually call the render function with these extra stuff
          // Also the extended column may also want to be filterable etc...
          const correctedExtendedColumns = columns.map((c) => {
            const newC: ColumnProps<T> = {
              ...c, render: (value, record, index) => {
                return c.render ? c.render(value, record, index, { ...env, variables }) : value;
              }
            };
            // If the column have a filter function, means it can be searched.
            // But if there's a filters, which means it's a drop down checkbox select,
            // then leave it be, antd will handle it
            return newC;
          });

          // Some extended column have the same key, we'll merge these columns
          const antdColumns = autoColumns
            .map((c) => {
              const extend = correctedExtendedColumns.find(ec => ec.key === c.key);
              return extend ? { ...c, ...extend } : c;
            });

          // Then some columns only exist in extendedColumns, add them
          correctedExtendedColumns.forEach((c) => {
            const exist = autoColumns.find(ac => ac.key === c.key);
            if (!exist) antdColumns.push(c as any);
          });

          // Table data must have only one key, one value, example allLocations: { ...}
          const [, fieldData = {}] = ((Object.entries(tableData) || [])[0] || []);
          const { nodes = [], totalCount = 0 } = fieldData as any;


          const { offset, orderBy: vorderBy } = variables;
          const current = Math.round(offset / pageSize) + 1;

          // To handler some column has custom defined sortFunction
          // for these, the orderBy will be changed to [], so we have no
          // information on what order the table is listed.
          // so set all auto-generated column to false
          // const { field, order } = toTableOrder(vorderBy);
          const columnsWithSort = antdColumns;
          // let columnsWithSort = vorderBy ? (antdColumns.map((column) => {
          //   if (column.key === field) {
          //     return { ...column, sortOrder: order };
          //   }
          //   if (column.sortOrder) {
          //     return { ...column, sortOrder: false };
          //   }
          //   return column;
          // })) : antdColumns;



          const antdPagination = (pagination || {});

          return (
            <div>

              <Table
                dataSource={nodes}
                columns={columnsWithSort}
                onChange={this.onChangeTable}
                pagination={{
                  position: antdPagination.position || 'both',
                  total: totalCount,
                  pageSize,
                  current,
                  showTotal: antdPagination.showTotal ?
                    antdPagination.showTotal :
                    total => `Total ${total} items`,
                  size: antdPagination.size,
                }}
                loading={tableLoading}
              />
            </div >
          );
        }
        }
      </Query >
    );
  }
}

export default InnerTable;
