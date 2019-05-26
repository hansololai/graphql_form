/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { __TypeKind } from "./../../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: enumTypeQuery
// ====================================================

export interface enumTypeQuery___type_enumValues {
  __typename: "__EnumValue";
  name: string;
}

export interface enumTypeQuery___type {
  __typename: "__Type";
  name: string | null;
  kind: __TypeKind;
  enumValues: enumTypeQuery___type_enumValues[] | null;
}

export interface enumTypeQuery {
  __type: enumTypeQuery___type | null;
}

export interface enumTypeQueryVariables {
  name: string;
}
