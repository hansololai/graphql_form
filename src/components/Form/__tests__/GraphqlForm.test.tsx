import * as React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { render, wait, fireEvent } from '@testing-library/react';
import { GraphqlForm, ValidatorFunc, GraphqlFormProps } from '../GraphqlForm';
import { HasOneInput, TextSelectInput } from '../widgets';
import { mockData, sampleSelectQuery } from '../__mock__/dataMock';

const waitUntilNoSpin = (container: any) => wait(() => {
  const isLoading = container.querySelector('.anticon-spin') !== null;
  const isLoading2 = container.querySelector('.ant-spin') !== null;
  expect(isLoading || isLoading2).toBe(false);
});
describe('Graphql Form', () => {
  it('Basic Form', async () => {
    const onSubmit = jest.fn();
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" instanceData={{ id: 1, firstName: 'test', email: 'test@test.com' }} onSubmit={onSubmit} />
        </div>
      </MockedProvider>,
    );

    expect(container).toMatchSnapshot();
    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
    // Try submit
    const formbutton = container.querySelector('button');
    expect(formbutton).not.toBeNull();
    if (formbutton) {
      fireEvent.click(formbutton);
      // wait until there is loading spinner on submit button
      await wait(() => {
        const isLoading = container.querySelector('.ant-btn-loading') !== null;
        expect(isLoading).toBe(true);
      });
      // wait until the spinner is gone
      await wait(() => {
        const isLoading = container.querySelector('.ant-btn-loading') !== null;
        expect(isLoading).toBe(false);
      });
      expect(onSubmit).toHaveBeenCalledTimes(1);
    }
  });
  it('With new model data', async () => {
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={() => { }} />
        </div>
      </MockedProvider>,
    );
    expect(container).toMatchSnapshot();
    await waitUntilNoSpin(container);

    expect(container).toMatchSnapshot();
  });
  it('With Custom Widget and Rule', async () => {
    const customWidgets: GraphqlFormProps['customWidgets'] = {
      firstName: ({ value, onChange }) => (
        <TextSelectInput
          value={value}
          onChange={onChange}
          inputOptions={[
        { name: 'John(Manager)', value: 'John' },
        { name: 'Robin(CEO)', value: 'Robin' },
        { name: 'Evan(Intern)', value: 'Evan' },
      ]}
        />
),
    };
    const customRule = {
      pattern: /@/,
    };
    const customValidator: ValidatorFunc = (rule, value, cb) => {
      // call cb() means no error
      // call cb("error message") means there is error
      if (Number(value) >= 10000 && Number(value) <= 50000) {
        cb();
      }
      cb('not within 10000 - 50000');
    };

    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm
            modelName="User"
            onSubmit={() => { }}
            customWidgets={customWidgets}
            customRules={{
              email: [customRule],
            }}
            customValidators={{
              salary: customValidator,
            }}
          />
        </div>
      </MockedProvider>,
    );
    expect(container).toMatchSnapshot();
    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
  });
  it('With Enum type', async () => {
    const { container } = render(
      <MockedProvider mocks={mockData}>
        <div style={{ width: 400 }}>
          <GraphqlForm modelName="User" onSubmit={() => { }} />
        </div>
      </MockedProvider>,
    );
    expect(container).toMatchSnapshot();

    await waitUntilNoSpin(container);
    expect(container).toMatchSnapshot();
  });
});
it('SelectWidget of user', async () => {
  const { container } = render(
    <MockedProvider mocks={mockData}>
      <HasOneInput selectQuery={sampleSelectQuery} nameField="name" valueField="id" filterField="name" value={null} onChange={() => { }} />

    </MockedProvider>,
  );
  expect(container).toMatchSnapshot();

  await waitUntilNoSpin(container);
  expect(container).toMatchSnapshot();
});
