/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { __TypeKind } from "../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: fieldTypeQuery
// ====================================================

export interface fieldTypeQuery___type_fields_type_ofType {
  __typename: "__Type";
  name: string | null;
  kind: __TypeKind;
}

export interface fieldTypeQuery___type_fields_type {
  __typename: "__Type";
  name: string | null;
  kind: __TypeKind;
  ofType: fieldTypeQuery___type_fields_type_ofType | null;
}

export interface fieldTypeQuery___type_fields {
  __typename: "__Field";
  name: string;
  type: fieldTypeQuery___type_fields_type;
}

export interface fieldTypeQuery___type {
  __typename: "__Type";
  fields: fieldTypeQuery___type_fields[] | null;
}

export interface fieldTypeQuery {
  __type: fieldTypeQuery___type | null;
}

export interface fieldTypeQueryVariables {
  name: string;
}
