import * as pluralize from 'pluralize';
import gql from 'graphql-tag';
import { fieldTypeQuery___type_fields } from 'components/Form/__generated__/fieldTypeQuery';

export interface buildGetCollectionQueryProps {
  model: string;
  fields: fieldTypeQuery___type_fields[];
  queryName?: string;
  pageSize?: number;
  pageInfo?: boolean;
  fragments?: Document[];
}

export const buildGetCollectionQuery: (p: buildGetCollectionQueryProps) => Document = ({ model, fields, queryName, pageSize = 50, pageInfo = true, fragments }) => {
  const typeName = pluralize.plural(model);
  const query = queryName || `all${typeName}`;

  // Process the fields, for scalar it's easy, but for object, we need to get the nested attributes
  // const filteredFields = fields.filter(f => !hideFields.includes(f.name));
  const fieldString = convertFieldsToString(fields);

  const nodeString = fieldString.length > 0 ? `nodes {
    ${fieldString.join(',')}
  }` : '';


  return gql`
   query ($condition: ${model}Condition, $customFilter:${model}CustomFilter, $filter: ${model}Filter, $first: Int = ${pageSize || 50}, $before: Cursor, $after: Cursor, $orderBy: [${typeName}OrderBy!] = PRIMARY_KEY_ASC, $offset: Int, $last: Int) {
    ${query}(first: $first, last: $last, before: $before, offset: $offset, after: $after, orderBy: $orderBy, condition: $condition, customFilter:$customFilter, filter: $filter) {
      ${nodeString}
      totalCount
      ${pageInfo &&
    `pageInfo {
        startCursor
        endCursor
        hasNextPage
        hasPreviousPage
      }`}
    }
  }
  `;
};
export const convertFieldsToString = (fields: fieldTypeQuery___type_fields[]) => {
  const toReturn: string[] = [];
  fields.forEach((field) => {
    const fieldString = convertFieldToString(field);
    if (fieldString) toReturn.push(fieldString);
  });
  return toReturn;
};

export const convertFieldToString = (field: fieldTypeQuery___type_fields) => {
  if (isScalar(field)) {
    return field.name;
  }
  // TODO: handle object
  return null;
}
export const isScalar: (f: fieldTypeQuery___type_fields) => boolean = (f) => {
  const { type: { kind, ofType } } = f;
  if (kind === 'SCALAR') {
    return true;
  }
  if (kind === 'NON_NULL') {
    if (ofType && ofType.kind === 'SCALAR') {
      return true;
    }
  }
  return false;
}
export const getFieldType: (f: fieldTypeQuery___type_fields) => string = (f) => {
  const { type: { kind, ofType, name } } = f;
  if (kind === 'SCALAR') {
    return name || 'String';
  }
  if (kind === 'NON_NULL') {
    if (ofType && ofType.kind === 'SCALAR') {
      return ofType.name || 'String';
    }
  }
  return 'String';
}