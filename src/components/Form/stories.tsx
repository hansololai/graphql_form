import * as React from 'react';
// Import the storybook libraries
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions'
// import { action } from '@storybook/addon-actions';
// Import our component from this folder
import { GraphqlForm } from './GraphqlForm';
import { TextInput, BooleanInput, TextSelectInput, HasOneInput } from './widgets';
import { MockedProvider } from '@apollo/react-testing';
import { mockData, sampleSelectQuery, } from './__mock__/dataMock';

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

storiesOf('SelectWidget', module)
  .add('User model', () => {
    return <MockedProvider mocks={mockData}>
      <HasOneInput selectQuery={sampleSelectQuery} nameField="name" valueField="id" filterField="name" value={null} onChange={(e) => {
        action("selected user with id ")(e);
      }} />

    </MockedProvider>


  })

storiesOf('GraphqlForm', module)
  .add('To Update User Model in 400px frame', () => (
    <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} />
      </div>
    </MockedProvider>
  )).add('To Create User Model with not null first name and email', () => {
    action('Input UserInput')({ textFormat: JSON.stringify(mockCreateInputData, undefined, 4) });
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
          const data = form.getFieldsValue();
          action('Data to process form.getFieldsValue()')(data);
        }} />
      </div>
    </MockedProvider>
  }).add('Use Custom widget (select text) for a field', () => {
    const customWidgets = {
      firstName: ({ value, onChange }) => <TextSelectInput value={value} onChange={onChange} inputOptions={[
        { name: 'John(Manager)', value: 'John' },
        { name: 'Robin(CEO)', value: 'Robin' },
        { name: 'Evan(Intern)', value: 'Evan' },
      ]} />
    };
    action('Input customWidgets Object')(customWidgets);
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
        }}
          customWidgets={customWidgets}
        />
      </div>
    </MockedProvider>
  }).add('Use Custom rules for email regex pattern', () => {
    const customRule = {
      pattern: /@/
    }
    action('Input CustomRule for email')(customRule);
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
        }}
          customRules={{
            email: [customRule]
          }}
        />
      </div>
    </MockedProvider>
  }).add('Use Custom validator for salary (in range 10000-50000)', () => {
    const customValidator = (rule, value, cb, source, options, form) => {
      // call cb() means no error
      // call cb("error message") means there is error
      if (Number(value) >= 10000 && Number(value) <= 50000) {
        cb();
      }
      cb("not within 10000 - 50000");
    }
    action('Input custom validator for salary')(customValidator);
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
        }}
          customValidators={{
            salary: customValidator
          }}
        />
      </div>
    </MockedProvider>
  }).add('A Enum type for role (CEO and CTO)', () => {
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form);
        }}
        />
      </div>
    </MockedProvider>
  }).add('A Select for Value', () => {
    return <MockedProvider mocks={mockData}>
      <div style={{ width: 400 }}>
        <GraphqlForm modelName="User" onSubmit={(form) => {
          action('Submit Clicked')(form.getFieldsValue());
        }}
          customWidgets={{
            managerId: ({ value, onChange }) => {
              return <HasOneInput
                selectQuery={sampleSelectQuery}
                nameField="name"
                valueField="id"
                filterField="name" value={value}
                onChange={onChange}
              />;
            }
          }}
        />
      </div>
    </MockedProvider>
  })