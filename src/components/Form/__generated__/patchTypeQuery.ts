/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { __TypeKind } from "./../../../../__generated__/globalTypes";

// ====================================================
// GraphQL query operation: patchTypeQuery
// ====================================================

export interface patchTypeQuery___type_inputFields_type_ofType {
  __typename: "__Type";
  name: string | null;
  kind: __TypeKind;
}

export interface patchTypeQuery___type_inputFields_type {
  __typename: "__Type";
  name: string | null;
  kind: __TypeKind;
  ofType: patchTypeQuery___type_inputFields_type_ofType | null;
}

export interface patchTypeQuery___type_inputFields {
  __typename: "__InputValue";
  name: string;
  /**
   * A GraphQL-formatted string representing the default value for this input value.
   */
  defaultValue: string | null;
  type: patchTypeQuery___type_inputFields_type;
}

export interface patchTypeQuery___type {
  __typename: "__Type";
  inputFields: patchTypeQuery___type_inputFields[] | null;
}

export interface patchTypeQuery {
  __type: patchTypeQuery___type | null;
}

export interface patchTypeQueryVariables {
  name: string;
}
