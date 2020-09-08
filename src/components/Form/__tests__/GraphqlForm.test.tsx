import * as React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { render, wait, fireEvent } from '@testing-library/react';
import { GraphqlForm } from '../GraphqlForm';
import { HasOneInput, TextSelectInput } from '../widgets';
import { mockData, sampleSelectQuery } from '../__mock__/dataMock'

const waitUntilNoSpin = (container: any) => wait(() => {
  const isLoading = container.querySelector('.anticon-spin') !== null;
  expect(isLoading).toBe(false);
});
describe('Graphql Form', () => {
  it('Basic Form', async () => {
    const onSubmit = jest.fn();
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: "test", email: "test@test.com" }} onSubmit={onSubmit} />
        </div>
      </MockedProvider>
    );

    expect(container).toMatchSnapshot();
    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
    // Try submit
    const formbutton = container.querySelector('button');
    expect(formbutton).not.toBeNull();
    fireEvent.click(formbutton);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
  it('With new model data', async () => {
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={(form) => { }} />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();
    await waitUntilNoSpin(container);

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
    const customValidator = (rule, value, cb, form) => {
      // call cb() means no error
      // call cb("error message") means there is error
      if (Number(value) >= 10000 && Number(value) <= 50000) {
        cb();
      }
      cb("not within 10000 - 50000");
    };

    const { container } = render(
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
    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
  });
  it('With Enum type', async () => {
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={(form) => { }} />
        </div>
      </MockedProvider>
    );
    expect(container).toMatchSnapshot();

    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
  });
})
it('SelectWidget of user', async () => {
  const { container } = render(
    <MockedProvider mocks={mockData}>
      <HasOneInput selectQuery={sampleSelectQuery} nameField="name" valueField="id" filterField="name" value={null} onChange={(e) => { }} />

    </MockedProvider>
  )
  expect(container).toMatchSnapshot();

  await waitUntilNoSpin(container);
  expect(container).toMatchSnapshot();
})