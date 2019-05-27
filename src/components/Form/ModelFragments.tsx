import { NameFunction } from './widgets';
import { Document } from 'graphql';
import gql from 'graphql-tag';

export type FilterFunction = (p: string) => any;


export interface SelectFragmentProp {
  selectQuery: Document;
  nameField: string | NameFunction;
  valueField: string | NameFunction;
  filterField: string | FilterFunction;
}


export const Task: SelectFragmentProp = {
  selectQuery: gql`
    query selectTaskQuery($filter: TaskFilter){
      allTasks(first:50,filter:$filter){
        nodes{
          id
          name
        }
      }
    }
  `,
  nameField: 'name',
  valueField: 'id',
  filterField: 'name',
}
