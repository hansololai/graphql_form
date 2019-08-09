import * as React from 'react';
import { MockedProvider } from 'react-apollo/test-utils';
import { render, wait } from '@testing-library/react';
import { GraphqlForm } from '../GraphqlForm';
import { HasOneInput, TextSelectInput } from '../widgets';
import { mockData, sampleSelectQuery } from '../__mock__/dataMock'
const waitUntilLoadingIsFinished = (queryByText: any) => wait(() => {
  const isLoading = queryByText('ant-spin') != null;
  expect(isLoading).toBe(false);
})

describe('Graphql Form', async () => {
  it('Basic Form', async () => {
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
    // @ts-ignore
    await waait(1);
    expect(container).toMatchSnapshot();
  });
  it('With new model data', async () => {
    const { queryByText, container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={(form) => { }} />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
    await waitUntilLoadingIsFinished(queryByText);

    expect(container).toMatchSnapshot();
  });
  it('With Custom Widget and Rule', async () => {
    const customWidgets = {
      firstName: ({ value, onChange }) => <TextSelectInput value={value} onChange={onChange} inputOptions={[
        { name: 'John(Manager)', value: 'John' },
        { name: 'Robin(CEO)', value: 'Robin' },
        { name: 'Evan(Intern)', value: 'Evan' },
      ]} />
    };
    const customRule = {
      pattern: /@/
    };
    const customValidator = (rule, value, cb, source, options, form) => {
      // call cb() means no error
      // call cb("error message") means there is error
      if (Number(value) >= 10000 && Number(value) <= 50000) {
        cb();
      }
      cb("not within 10000 - 50000");
    };

    const { container, queryByText } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={(form) => { }}
            customWidgets={customWidgets}
            customRules={{
              email: [customRule]
            }}
            customValidators={{
              salary: customValidator
            }}
          />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
    await waitUntilLoadingIsFinished(queryByText);
    expect(container).toMatchSnapshot();
  });
  it('With Enum type', async () => {
    const { container, queryByText } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={(form) => { }} />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();

    await waitUntilLoadingIsFinished(queryByText);
    expect(container).toMatchSnapshot();
  });
})
it('SelectWidget of user', async () => {
  const { container, queryByText } = render(
    <MockedProvider mocks={mockData}>
      <HasOneInput selectQuery={sampleSelectQuery} nameField="name" valueField="id" filterField="name" value={null} onChange={(e) => { }} />

    </MockedProvider>
  )
  expect(container).toMatchSnapshot();

  await waitUntilLoadingIsFinished(queryByText);
  expect(container).toMatchSnapshot();
})