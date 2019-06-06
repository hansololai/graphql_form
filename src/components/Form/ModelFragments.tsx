import { NameFunction } from './widgets';
import { Document } from 'graphql';
// import gql from 'graphql-tag';

export type FilterFunction = (p: string) => object;


export interface SelectFragmentProp {
  selectQuery: Document;
  nameField: string | NameFunction;
  valueField?: string | NameFunction;
  filterField: string | FilterFunction;
}
