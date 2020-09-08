import { NameFunction } from './widgets';
import { DocumentNode } from 'graphql';
// import gql from 'graphql-tag';

export type FilterFunction = (p: string) => object;


export interface SelectFragmentProp {
  selectQuery: DocumentNode;
  nameField: string | NameFunction;
  valueField?: string | NameFunction;
  filterField: string | FilterFunction;
}
