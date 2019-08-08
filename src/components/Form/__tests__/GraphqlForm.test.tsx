import * as React from 'react';
import { updateInputQuery, modelFieldsQuery } from '../queries';
import { enumQuery } from '../widgets/index';
import gql from 'graphql-tag';
import { MockedProvider } from 'react-apollo/test-utils';
import { render } from '@testing-library/react';
import { GraphqlForm } from '../GraphqlForm';

const sampleSelectQuery = gql`
  query selectUser($first:Int, $filter:UserFilter){
    allUsers(first:$first, filter: $filter){
      nodes{
        id
        name
      }
    }
  }
`;
const mockTypeQueryData = {
  data: {
    __type: {
      __typename: "__Type",
      inputFields: [
        {
          "name": "id",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "firstName",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "email",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "salary",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "isAdmin",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "Boolean",
            "kind": "SCALAR",
            "ofType": null
          }
        },
      ]
    }
  }
}

const mockCreateInputData = {
  data: {
    __type: {
      __typename: "__Type",
      inputFields: [
        {
          "name": "id",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "firstName",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR",
              "__typename": "__Type"
            }
          }
        },
        {
          "name": "email",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "String",
              "kind": "SCALAR",
              "__typename": "__Type"
            }
          }
        },
        {
          "name": "salary",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",

            "name": "Int",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "isAdmin",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "Boolean",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "role",
          "__typename": "__InputValue",
          "defaultValue": null,
          "type": {
            "__typename": "__Type",
            "name": "UserRoleTypeEnum",
            "kind": "ENUM",
            "ofType": null
          }
        },
      ]
    }
  }
}

const userRoleTypeEnumData = {
  "data": {
    "__type": {
      "name": "UserRoleTypeEnum",
      "__typename": "__Type",
      "kind": "ENUM",
      "enumValues": [
        {
          "name": "CEO",
          "__typename": "__EnumValue",
        },
        {
          "name": "CTO",
          "__typename": "__EnumValue",
        }
      ],
    }
  }
}
const mockUserSelectData = {
  "data": {
    "allUsers": {
      "nodes": [
        { id: 1, name: "Kyle", __typename: "User" },
        { id: 2, name: "John", __typename: "User" },
        { id: 3, name: "George", __typename: "User" },
      ],
      __typename: "UserConnection"
    }
  }
}
const mockUserSelectDataOnlyJ = {
  "data": {
    "allUsers": {
      "nodes": [
        { id: 2, name: "John", __typename: "User" },
      ],
      __typename: "UserConnection"
    }
  }
}

const mockUserModelFieldData = {
  "data": {
    "__type": {
      "__typename": "__Type",
      "fields": [
        {
          "__typename": "__Field",
          "name": "nodeId",
          "type": {
            "__typename": "__Type",
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "__typename": "__Type",
              "name": "ID",
              "kind": "SCALAR"
            }
          }
        },
      ],
    },
  }
}


const mockData = [
  {
    request: {
      query: modelFieldsQuery,
      variables: { name: "User" },
    },
    result: mockUserModelFieldData
  },
  {
    request: {
      query: sampleSelectQuery,
      variables: { first: 50, filter: { name: { includesInsensitive: "" } } }
    },
    result: mockUserSelectData,
  },
  {
    request: {
      query: sampleSelectQuery,
      variables: { first: 50, filter: { name: { includesInsensitive: "J" } } }
    },
    result: mockUserSelectDataOnlyJ,
  },
  {
    request: {
      query: updateInputQuery,
      variables: { name: 'UserPatch' },
    },
    result: mockTypeQueryData
  },
  {
    request: {
      query: updateInputQuery,
      variables: { name: 'UserInput' },
    },
    result: mockCreateInputData
  },
  {
    request: {
      query: enumQuery,
      variables: { name: 'UserRoleTypeEnum' },
    },
    result: userRoleTypeEnumData
  }

]


it('Basic Graphql Form', () => {
  const { container } = render(
    <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} />
      </div>
    </MockedProvider>
  );
  expect(container).toMatchSnapshot();
})