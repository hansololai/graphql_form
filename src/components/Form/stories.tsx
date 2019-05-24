import * as React from 'react';
// Import the storybook libraries
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions'
// import { action } from '@storybook/addon-actions';
// Import our component from this folder
import { updateInputQuery, GraphqlForm } from './GraphqlForm';
import { TextInput, BooleanInput } from './widgets';
import { MockedProvider } from 'react-apollo/test-utils';

// Here we describe the stories we want to see of the Button. The component is
// pretty simple so we will just make two, one with text and one with emojis
// Simple call storiesOf and then chain .add() as many times as you wish
//
// .add() takes a name and then a function that should return what you want
// rendered in the rendering area
storiesOf('Boolean Widget', module)
  .add('Checked', () => (
    <BooleanInput value={true} />
  ))
  .add('Unchecked', () => (
    <BooleanInput value={false} />
  ));

storiesOf('Text Widget', module)
  .add('With Text', () => (
    <TextInput value="Test " />
  ))
  .add('Without Text', () => (
    <TextInput value="" />
  ));
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
      ]
    }
  }
}

const mockData = [
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
  }

]

storiesOf('GraphqlForm', module)
  .add('To Update User Model in 400px frame', () => (
    <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} />
      </div>
    </MockedProvider>
  )).add('To Create User Model with not null first name and email', () => {
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
          const data = form.getFieldsValue();
          action('Data to process form.getFieldsValue()')(data);
        }} />
      </div>
    </MockedProvider>
  })